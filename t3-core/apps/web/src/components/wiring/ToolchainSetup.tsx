import { ArrowDownCircle, Check, Download, Info, X, AlertTriangle, Loader2 } from "lucide-react";
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
import { useAtomCommand } from "~/state/use-atom-command";
import {
  ToolchainState,
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

  const fetchStatus = useCallback(
    async (retries = 3) => {
      if (!environmentId) return;

      const result = await getStatus({ environmentId });

      if (result._tag === "Success") {
        const s = result.value as {
          platformioInstalled: boolean;
          platformioVersion: string | null;
          arduinoInstalled: boolean;
          arduinoVersion: string | null;
        };
        updateToolchainState({
          platformioInstalled: s.platformioInstalled,
          platformioVersion: s.platformioVersion,
          arduinoInstalled: s.arduinoInstalled,
          arduinoVersion: s.arduinoVersion,
          statusLoaded: true,
        });
      } else if (retries > 0) {
        setTimeout(() => void fetchStatus(retries - 1), 2000);
      } else {
        updateToolchainState({ statusLoaded: true });
      }
    },
    [environmentId, getStatus],
  );

  return fetchStatus;
}

export function useToolchainState(): ToolchainState {
  const environmentId = useAtomValue(primaryEnvironmentIdAtom);
  const snap = useAtomValue(toolchainStateAtom);
  const fetchStatus = useFetchToolchainStatus();

  useEffect(() => {
    if (!environmentId || snap.statusLoaded) return;
    void fetchStatus();
  }, [environmentId, snap.statusLoaded, fetchStatus]);

  return snap;
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
      <div className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-background p-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            Installing {snap.installing === "platformio" ? "PlatformIO" : "Arduino CLI"}
          </span>
          <button
            type="button"
            onClick={() => updateToolchainState({ installing: null, progress: 0 })}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Cancel"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-muted py-2">
          <div
            className="absolute left-0 top-0 h-full bg-primary/30 transition-all duration-300 ease-out"
            style={{ width: `${snap.progress}%` }}
          />
          <span className="relative z-10 text-sm font-medium text-foreground">
            {snap.progress}% Completed
          </span>
        </div>
      </div>
    );
  }

  // Error state — inline error banner
  if (snap.error) {
    return (
      <div className="flex w-full flex-col gap-2 rounded-2xl border border-destructive/50 bg-destructive/10 p-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            Installation Error
          </span>
          <button
            type="button"
            onClick={() => updateToolchainState({ error: null })}
            className="text-destructive/80 transition-colors hover:text-destructive"
            aria-label="Dismiss error"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="text-xs leading-relaxed text-destructive/90">{snap.error}</p>
      </div>
    );
  }

  // Default state — Getting Started
  const isAnyInstalled = snap.platformioInstalled || snap.arduinoInstalled;

  if (!snap.statusLoaded) return null;
  if (isAnyInstalled) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (val) void fetchStatus();
      }}
    >
      <div className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-background p-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-foreground">Getting Started</span>
        </div>
        <DialogTrigger className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-muted py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <ArrowDownCircle className="size-4" />
          <span>Configure Toolchain</span>
        </DialogTrigger>
      </div>

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
          className={`flex flex-col gap-3 rounded-xl border p-5 transition-all ${
            activeToolchain === "platformio"
              ? "border-emerald-600/50 bg-emerald-950/20"
              : "border-border bg-card hover:border-border/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-foreground">PlatformIO</span>
              {snap.platformioInstalled ? (
                <span className="flex items-center gap-1 rounded-full border border-emerald-800/50 bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                  <Check className="size-3" />
                  {snap.platformioVersion
                    ? snap.platformioVersion.replace(/^PlatformIO\s*/i, "")
                    : "INSTALLED"}
                </span>
              ) : (
                <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold tracking-wide text-primary">
                  RECOMMENDED
                </span>
              )}
            </div>
            <Button
              disabled={!!snap.installing}
              variant={
                snap.platformioInstalled
                  ? activeToolchain === "platformio"
                    ? "outline"
                    : "secondary"
                  : "default"
              }
              className={
                snap.platformioInstalled
                  ? activeToolchain === "platformio"
                    ? "cursor-default border-emerald-800/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/40"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }
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
                  Installing ({snap.progress}%)...
                </>
              ) : snap.platformioInstalled ? (
                activeToolchain === "platformio" ? (
                  <>Selected</>
                ) : (
                  <>Select</>
                )
              ) : (
                <>
                  <Download className="mr-2 size-4" />
                  Install
                </>
              )}
            </Button>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Professional multi-platform build engine, supports 1,000+ boards, ESP-IDF, FreeRTOS, and
            library management.
          </p>
          {snap.installing === "platformio" && (
            <div className="relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-muted py-1.5 text-xs font-medium">
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
          className={`flex flex-col gap-3 rounded-xl border p-5 transition-all ${
            activeToolchain === "arduino"
              ? "border-emerald-600/50 bg-emerald-950/20"
              : "border-border bg-card hover:border-border/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-foreground">Arduino CLI</span>
              {snap.arduinoInstalled && (
                <span className="flex items-center gap-1 rounded-full border border-emerald-800/50 bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                  <Check className="size-3" />
                  {snap.arduinoVersion
                    ? snap.arduinoVersion.replace(/^Arduino CLI\s*/i, "")
                    : "INSTALLED"}
                </span>
              )}
            </div>
            <Button
              disabled={!!snap.installing}
              variant={
                snap.arduinoInstalled
                  ? activeToolchain === "arduino"
                    ? "outline"
                    : "secondary"
                  : "outline"
              }
              className={
                snap.arduinoInstalled
                  ? activeToolchain === "arduino"
                    ? "cursor-default border-emerald-800/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/40"
                    : "bg-secondary border-border text-secondary-foreground hover:bg-secondary/80"
                  : "border-border bg-transparent text-foreground hover:bg-accent"
              }
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
                  Installing ({snap.progress}%)...
                </>
              ) : snap.arduinoInstalled ? (
                activeToolchain === "arduino" ? (
                  <>Selected</>
                ) : (
                  <>Select</>
                )
              ) : (
                <>
                  <Download className="mr-2 size-4" />
                  Install
                </>
              )}
            </Button>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Official lightweight Arduino command line toolchain for quick sketching and AVR and SAMD
            boards.
          </p>
          {snap.installing === "arduino" && (
            <div className="relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-muted py-1.5 text-xs font-medium">
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
