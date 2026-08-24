import * as React from "react";
import * as Cause from "effect/Cause";
import { AlertTriangle, CheckIcon, CircleIcon, Loader2, X, ZapIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "~/components/ui/dialog";
import { usePrimaryEnvironmentId } from "~/state/environments";
import { useAtomCommand } from "~/state/use-atom-command";
import {
  toolchainInstallCommand,
  updateToolchainState,
  useActiveToolchain,
} from "~/state/toolchain";
import { useFetchToolchainStatus, useToolchainState } from "~/components/wiring/ToolchainSetup";

type SwitcherToolchain = "platformio" | "arduino";

const TOOLCHAIN_OPTIONS: ReadonlyArray<{
  readonly type: SwitcherToolchain;
  readonly name: string;
  readonly description: string;
}> = [
  {
    type: "platformio",
    name: "PlatformIO",
    description: "Multi-platform build engine with support for 1,000+ boards.",
  },
  {
    type: "arduino",
    name: "Arduino CLI",
    description: "Lightweight CLI for Arduino sketches and AVR boards.",
  },
];

export function ToolchainSwitcherDialog() {
  const environmentId = usePrimaryEnvironmentId();
  const [activeToolchain, setActiveToolchain] = useActiveToolchain();
  const snap = useToolchainState();
  const fetchStatus = useFetchToolchainStatus();
  const install = useAtomCommand(toolchainInstallCommand, {
    label: "toolchain-install",
    reportFailure: false,
  });

  const handleInstall = React.useCallback(
    async (type: SwitcherToolchain) => {
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
        setActiveToolchain(type);
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
    [environmentId, install, snap, setActiveToolchain, fetchStatus],
  );

  return (
    <DialogPopup className="max-w-md border border-border bg-background">
      <DialogHeader className="pb-2">
        <DialogTitle className="flex items-center gap-2 text-foreground">
          <ZapIcon className="size-5" />
          Toolchains
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Choose the active build toolchain used for compiling, flashing, and AI chat context.
        </DialogDescription>
      </DialogHeader>

      <DialogPanel scrollFade={false} className="flex flex-col gap-3 p-6 pt-2">
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

        {TOOLCHAIN_OPTIONS.map((option) => {
          const installed =
            option.type === "platformio" ? snap.platformioInstalled : snap.arduinoInstalled;
          const version =
            option.type === "platformio" ? snap.platformioVersion : snap.arduinoVersion;
          const isActive = activeToolchain === option.type;
          const isInstalling = snap.installing === option.type;
          const versionLabel = version
            ? option.type === "platformio"
              ? version.replace(/^PlatformIO\s*/i, "")
              : version.replace(/^Arduino CLI\s*/i, "")
            : "Installed";

          return (
            <div
              key={option.type}
              className={`flex flex-col gap-3 rounded-lg border p-4 transition-colors ${
                isActive ? "border-primary/50 bg-primary/5" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  disabled={!installed || !!snap.installing}
                  onClick={() => setActiveToolchain(option.type)}
                  className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="mt-0.5 shrink-0">
                    {isActive ? (
                      <CheckIcon className="size-4 text-foreground" />
                    ) : (
                      <CircleIcon className="size-4 opacity-20" />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      {option.name}
                      {installed && (
                        <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                          <CheckIcon className="size-3 text-emerald-500" />
                          {versionLabel}
                        </span>
                      )}
                    </span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {installed ? option.description : "Not installed on this system"}
                    </span>
                  </span>
                </button>
                {isInstalling ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                ) : !installed ? (
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={!!snap.installing}
                    onClick={() => void handleInstall(option.type)}
                  >
                    Install
                  </Button>
                ) : null}
              </div>
              {isInstalling && (
                <div className="relative flex h-6 w-full items-center justify-center overflow-hidden rounded-md bg-muted text-xs font-medium">
                  <div
                    className="absolute left-0 top-0 h-full bg-primary/30 transition-all duration-300 ease-out"
                    style={{ width: `${snap.progress}%` }}
                  />
                  <span className="relative z-10 text-foreground">{snap.progress}%</span>
                </div>
              )}
            </div>
          );
        })}
      </DialogPanel>
    </DialogPopup>
  );
}
