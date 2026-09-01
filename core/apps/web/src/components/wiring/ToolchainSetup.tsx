import {
  AlertTriangle,
  ArrowDownCircle,
  Check,
  ChevronRight,
  Info,
  Loader2,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAtomValue } from "@effect/atom-react";
import * as Cause from "effect/Cause";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { primaryEnvironmentIdAtom } from "~/state/primaryEnvironment";
import { usePrimaryEnvironment } from "~/state/environments";
import { useAtomCommand } from "~/state/use-atom-command";
import {
  ToolchainState,
  initialToolchainState,
  toolchainGetStatusCommand,
  toolchainInstallCommand,
  toolchainStateAtom,
  updateToolchainState,
  useActiveToolchain,
} from "~/state/toolchain";

// ---------------------------------------------------------------------------
// Hooks for toolchain status fetching and state consumption
// ---------------------------------------------------------------------------
export function useFetchToolchainStatus() {
  const environmentId = useAtomValue(primaryEnvironmentIdAtom);
  const getStatus = useAtomCommand(toolchainGetStatusCommand, {
    label: "toolchain-get-status",
    reportFailure: false,
  });

  const fetchStatus = useCallback(async () => {
    if (!environmentId) return;

    const result = await getStatus({ environmentId });

    if (result._tag === "Success") {
      const s = result.value as {
        platformioInstalled: boolean;
        platformioVersion: string | null;
        platformioPath: string | null;
        arduinoInstalled: boolean;
        arduinoVersion: string | null;
        arduinoCliPath: string | null;
      };
      updateToolchainState({
        environmentId,
        platformioInstalled: s.platformioInstalled,
        platformioVersion: s.platformioVersion,
        platformioPath: s.platformioPath,
        arduinoInstalled: s.arduinoInstalled,
        arduinoVersion: s.arduinoVersion,
        arduinoCliPath: s.arduinoCliPath,
        statusLoaded: true,
        statusError: false,
      });
    } else {
      // A transport or startup failure is not evidence that the user's
      // installed toolchains disappeared. Keep the setup prompt hidden and
      // retry when the environment reconnects or the dialog is opened.
      updateToolchainState({ environmentId, statusLoaded: true, statusError: true });
    }
  }, [environmentId, getStatus]);

  return fetchStatus;
}

export function useToolchainState(): ToolchainState {
  const environmentId = useAtomValue(primaryEnvironmentIdAtom);
  const primaryEnvironment = usePrimaryEnvironment();
  const snap = useAtomValue(toolchainStateAtom);
  const fetchStatus = useFetchToolchainStatus();
  const isCurrentEnvironment = snap.environmentId === environmentId;

  useEffect(() => {
    if (
      !environmentId ||
      primaryEnvironment?.connection.phase !== "connected" ||
      (isCurrentEnvironment && snap.statusLoaded && !snap.statusError)
    ) {
      return;
    }
    void fetchStatus();
  }, [
    environmentId,
    primaryEnvironment?.connection.phase,
    isCurrentEnvironment,
    snap.statusLoaded,
    snap.statusError,
    fetchStatus,
  ]);

  return isCurrentEnvironment
    ? snap
    : { ...initialToolchainState, environmentId, statusLoaded: false };
}

// ---------------------------------------------------------------------------
// Toolchain Setup Pill Component
// ---------------------------------------------------------------------------
export function ToolchainSetupPill() {
  const [open, setOpen] = useState(false);
  const [activeToolchain, setActiveToolchain] = useActiveToolchain();
  const snap = useToolchainState();
  const fetchStatus = useFetchToolchainStatus();

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-toolchain-dialog", handleOpen);
    return () => window.removeEventListener("open-toolchain-dialog", handleOpen);
  }, []);

  // Auto-select toolchain if none is selected but one is installed
  useEffect(() => {
    if (snap.statusLoaded && !activeToolchain) {
      if (snap.platformioInstalled) setActiveToolchain("platformio");
      else if (snap.arduinoInstalled) setActiveToolchain("arduino");
    }
  }, [
    snap.statusLoaded,
    snap.platformioInstalled,
    snap.arduinoInstalled,
    activeToolchain,
    setActiveToolchain,
  ]);

  // Error banner auto-dismiss after 8s
  useEffect(() => {
    if (snap.error) {
      const timer = setTimeout(() => updateToolchainState({ error: null }), 8000);
      return () => clearTimeout(timer);
    }
  }, [snap.error]);

  // Installing state — full-width progress bar
  if (snap.installing) {
    return (
      <div className="flex w-full flex-col gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-control-surface p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2 text-[13px] font-semibold tracking-tight text-sidebar-foreground">
            <Loader2 className="size-4 shrink-0 animate-spin text-sidebar-foreground" />
            <span className="truncate">
              Installing {snap.installing === "platformio" ? "PlatformIO" : "Arduino CLI"}
            </span>
          </span>
          <button
            type="button"
            onClick={() => updateToolchainState({ installing: null, progress: 0 })}
            className="shrink-0 text-[var(--sidebar-icon-color)] transition-colors hover:text-sidebar-foreground"
            aria-label="Cancel"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="relative flex h-8 w-full items-center justify-center overflow-hidden rounded-[var(--control-radius)] bg-sidebar ring-1 ring-sidebar-border">
          <div
            className="absolute inset-y-0 left-0 bg-sidebar-foreground/15 transition-all duration-300 ease-out"
            style={{ width: `${snap.progress}%` }}
          />
          <span className="relative z-10 text-xs font-medium tabular-nums text-sidebar-foreground">
            {snap.progress}% Completed
          </span>
        </div>
      </div>
    );
  }

  // Error state — inline error banner
  if (snap.error) {
    return (
      <div className="flex w-full flex-col gap-1.5 rounded-xl border border-destructive/40 bg-destructive/10 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2 text-[13px] font-semibold tracking-tight text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            Installation Error
          </span>
          <button
            type="button"
            onClick={() => updateToolchainState({ error: null })}
            className="shrink-0 text-destructive/70 transition-colors hover:text-destructive"
            aria-label="Dismiss error"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="break-words text-xs leading-relaxed text-destructive/90">{snap.error}</p>
      </div>
    );
  }

  // Default state — Getting Started
  const isAnyInstalled = snap.platformioInstalled || snap.arduinoInstalled;

  if (!snap.statusLoaded || snap.statusError) return null;
  if (isAnyInstalled) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (val) void fetchStatus();
      }}
    >
      <DialogTrigger className="group/toolchain-card flex w-full cursor-pointer flex-col gap-2.5 rounded-[var(--control-radius)] border border-sidebar-border bg-sidebar-control-surface p-2.5 text-left outline-hidden ring-ring transition-[background-color,border-color,box-shadow] hover:bg-sidebar-row-hover hover:shadow-xs focus-visible:ring-2">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[calc(var(--control-radius)-2px)] bg-sidebar text-sidebar-muted-foreground/80 shadow-xs ring-1 ring-sidebar-border transition-[background-color,box-shadow,color] duration-200 group-hover/toolchain-card:bg-sidebar-row-active group-hover/toolchain-card:text-sidebar-foreground group-hover/toolchain-card:shadow-sm">
            <Sparkles className="size-3.5 transition-colors" />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-[13px] font-semibold tracking-tight text-sidebar-foreground">
              Getting Started
            </span>
            <span className="truncate text-[11px] leading-none text-sidebar-muted-foreground">
              Set up a build engine
            </span>
          </span>
        </div>
        <span className="flex items-center gap-2 rounded-[var(--control-radius)] bg-sidebar py-2 ps-2.5 pe-2 text-xs font-medium text-sidebar-muted-foreground ring-1 ring-sidebar-border/70 transition-[background-color,color,box-shadow] group-hover/toolchain-card:bg-sidebar-row-active group-hover/toolchain-card:text-sidebar-foreground group-hover/toolchain-card:shadow-xs">
          <Wrench className="size-3.5 shrink-0 transition-colors" />
          <span>Configure Toolchain</span>
          <ChevronRight className="ms-auto size-3.5 shrink-0 opacity-60 transition-[color,opacity,transform] duration-200 group-hover/toolchain-card:translate-x-0.5 group-hover/toolchain-card:opacity-100" />
        </span>
      </DialogTrigger>

      <ToolchainSetupDialog />
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Toolchain Setup Dialog Component
// ---------------------------------------------------------------------------
export function ToolchainSetupDialog() {
  const environmentId = useAtomValue(primaryEnvironmentIdAtom);
  const [activeToolchain, setActiveToolchain] = useActiveToolchain();
  const snap = useToolchainState();
  const fetchStatus = useFetchToolchainStatus();
  const install = useAtomCommand(toolchainInstallCommand, {
    label: "toolchain-install",
    reportFailure: false,
  });

  const handleInstall = useCallback(
    async (type: "platformio" | "arduino") => {
      if (!environmentId) {
        updateToolchainState({
          error: "No environment connected. Please wait for the connection to establish.",
        });
        return;
      }
      if (snap.installing) return;

      updateToolchainState({ installing: type, progress: 5, error: null });

      const result = await install({
        environmentId,
        type,
        onProgress: (p: number) => {
          updateToolchainState({ progress: Math.max(5, p) });
        },
      });

      if (result._tag === "Success") {
        updateToolchainState({
          installing: null,
          progress: 100,
          platformioInstalled: type === "platformio" ? true : snap.platformioInstalled,
          arduinoInstalled: type === "arduino" ? true : snap.arduinoInstalled,
        });
        if (!activeToolchain) setActiveToolchain(type);
        void fetchStatus();
      } else {
        const cause = Cause.squash(result.cause);
        const errMsg =
          cause instanceof Error
            ? cause.message
            : typeof cause === "string"
              ? cause
              : "Installation failed. Check terminal/logs for details.";
        updateToolchainState({ installing: null, progress: 0, error: errMsg });
      }
    },
    [environmentId, install, snap, activeToolchain, setActiveToolchain, fetchStatus],
  );

  return (
    <DialogPopup className="max-w-xl border border-border bg-background">
      <DialogHeader className="pb-2">
        <DialogTitle className="flex items-center gap-2 text-foreground">
          <ArrowDownCircle className="size-6" />
          Configure Toolchain
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Select and install a build engine to compile and flash your embedded project.
        </DialogDescription>
      </DialogHeader>

      <DialogPanel className="flex flex-col gap-4 p-6 pt-2">
        {/* Error Alert in Modal */}
        {snap.error && (
          <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{snap.error}</span>
            </div>
            <button
              type="button"
              onClick={() => updateToolchainState({ error: null })}
              className="text-destructive/80 transition-colors hover:text-destructive"
              aria-label="Dismiss error"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* PlatformIO Card */}
        <div
          className={`flex flex-col gap-3 rounded-lg border p-4 transition-colors ${
            activeToolchain === "platformio"
              ? "border-primary/50 bg-primary/5"
              : "border-border bg-card hover:bg-accent/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">PlatformIO</span>
              {snap.platformioInstalled ? (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="size-3 text-emerald-500" />
                  {snap.platformioVersion
                    ? snap.platformioVersion.replace(/^PlatformIO\s*/i, "")
                    : "Installed"}
                </span>
              ) : (
                <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                  Recommended
                </span>
              )}
            </div>
            <Button
              disabled={!!snap.installing || activeToolchain === "platformio"}
              variant={
                snap.platformioInstalled
                  ? activeToolchain === "platformio"
                    ? "outline"
                    : "secondary"
                  : "default"
              }
              size="sm"
              onClick={() => {
                if (snap.platformioInstalled) {
                  if (activeToolchain !== "platformio") setActiveToolchain("platformio");
                } else {
                  void handleInstall("platformio");
                }
              }}
            >
              {snap.installing === "platformio" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Installing...
                </>
              ) : activeToolchain === "platformio" ? (
                "Selected"
              ) : snap.platformioInstalled ? (
                "Select"
              ) : (
                "Install"
              )}
            </Button>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Professional multi-platform build engine, supports 1,000+ boards, ESP-IDF, FreeRTOS, and
            library management.
          </p>
          {snap.installing === "platformio" && (
            <div className="relative flex w-full items-center justify-center overflow-hidden rounded-md bg-muted py-1.5 text-xs font-medium">
              <div
                className="absolute left-0 top-0 h-full bg-primary/30 transition-all duration-300 ease-out"
                style={{ width: `${snap.progress}%` }}
              />
              <span className="relative z-10 text-foreground">{snap.progress}% Completed</span>
            </div>
          )}
        </div>

        {/* Arduino CLI Card */}
        <div
          className={`flex flex-col gap-3 rounded-lg border p-4 transition-colors ${
            activeToolchain === "arduino"
              ? "border-primary/50 bg-primary/5"
              : "border-border bg-card hover:bg-accent/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Arduino CLI</span>
              {snap.arduinoInstalled && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="size-3 text-emerald-500" />
                  {snap.arduinoVersion
                    ? snap.arduinoVersion.replace(/^Arduino CLI\s*/i, "")
                    : "Installed"}
                </span>
              )}
            </div>
            <Button
              disabled={!!snap.installing || activeToolchain === "arduino"}
              variant={
                snap.arduinoInstalled
                  ? activeToolchain === "arduino"
                    ? "outline"
                    : "secondary"
                  : "outline"
              }
              size="sm"
              onClick={() => {
                if (snap.arduinoInstalled) {
                  if (activeToolchain !== "arduino") setActiveToolchain("arduino");
                } else {
                  void handleInstall("arduino");
                }
              }}
            >
              {snap.installing === "arduino" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Installing...
                </>
              ) : activeToolchain === "arduino" ? (
                "Selected"
              ) : snap.arduinoInstalled ? (
                "Select"
              ) : (
                "Install"
              )}
            </Button>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Official lightweight Arduino command line toolchain for quick sketching and AVR and SAMD
            boards.
          </p>
          {snap.installing === "arduino" && (
            <div className="relative flex w-full items-center justify-center overflow-hidden rounded-md bg-muted py-1.5 text-xs font-medium">
              <div
                className="absolute left-0 top-0 h-full bg-primary/30 transition-all duration-300 ease-out"
                style={{ width: `${snap.progress}%` }}
              />
              <span className="relative z-10 text-foreground">{snap.progress}% Completed</span>
            </div>
          )}
        </div>
      </DialogPanel>

      <div className="rounded-b-[calc(var(--radius-2xl)-1px)] bg-background px-6 py-4">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
          <Info className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            This will be installed globally on your system.
          </span>
        </div>
      </div>
    </DialogPopup>
  );
}
