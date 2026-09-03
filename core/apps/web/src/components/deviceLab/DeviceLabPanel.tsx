import type { ScopedThreadRef } from "@embedino/contracts";
import { CheckCircle2, Circle, LoaderCircle, TerminalSquare, Usb, XCircle } from "lucide-react";
import { useMemo } from "react";

import type { DeviceLabSurface } from "~/rightPanelStore";
import type { WorkLogEntry } from "~/session-logic";
import { useAttachedTerminalSession } from "~/state/terminalSessions";
import { cn } from "~/lib/utils";

import { deriveFlashProgress, formatFlashOutput, type FlashStage } from "./flashProgress";
import { agentFlashSessionState } from "./agentFlashActivity";

const FLASH_PHASES: ReadonlyArray<{ stage: FlashStage; label: string }> = [
  { stage: "building", label: "Build" },
  { stage: "uploading", label: "Upload" },
  { stage: "verifying", label: "Verify" },
];

const STAGE_INDEX: Readonly<Record<FlashStage, number>> = {
  preparing: -1,
  building: 0,
  uploading: 1,
  verifying: 2,
  complete: 3,
  failed: -1,
};

function statusTitle(stage: FlashStage): string {
  switch (stage) {
    case "preparing":
      return "Preparing flash";
    case "building":
      return "Building firmware";
    case "uploading":
      return "Flashing board";
    case "verifying":
      return "Verifying firmware";
    case "complete":
      return "Flash complete";
    case "failed":
      return "Flash failed";
  }
}

function PhaseIcon({ phase, current }: { phase: number; current: FlashStage }) {
  const currentIndex = STAGE_INDEX[current];
  if (current === "complete" || phase < currentIndex) {
    return <CheckCircle2 aria-hidden="true" className="size-4 text-emerald-500" />;
  }
  if (phase === currentIndex && current !== "failed") {
    return <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-primary" />;
  }
  return <Circle aria-hidden="true" className="size-4 text-muted-foreground/40" />;
}

export function DeviceLabPanel({
  surface,
  threadRef,
  agentActivity,
  onOpenTerminal,
}: {
  surface: DeviceLabSurface;
  threadRef: ScopedThreadRef;
  agentActivity: WorkLogEntry | null;
  onOpenTerminal: () => void;
}) {
  const isAgentFlash = surface.agentToolCallId !== undefined;
  const terminal = useAttachedTerminalSession({
    environmentId: threadRef.environmentId,
    terminal: isAgentFlash
      ? null
      : { threadId: threadRef.threadId, terminalId: surface.terminalId },
  });
  const agentSession = isAgentFlash
    ? agentFlashSessionState(surface.agentCommand ?? "Agent flash command", agentActivity)
    : null;
  const sessionBuffer = agentSession?.buffer ?? terminal.buffer;
  const sessionStatus = agentSession?.status ?? terminal.status;
  const sessionError = agentSession?.error ?? terminal.error;
  const hasRunningSubprocess = agentSession?.hasRunningSubprocess ?? terminal.hasRunningSubprocess;
  const progress = useMemo(
    () =>
      deriveFlashProgress({
        buffer: sessionBuffer,
        hasRunningSubprocess,
        terminalStatus: sessionStatus,
        terminalError:
          surface.error ??
          (isAgentFlash || terminal.summary !== null || terminal.version > 0 ? sessionError : null),
      }),
    [
      hasRunningSubprocess,
      isAgentFlash,
      sessionBuffer,
      sessionError,
      sessionStatus,
      terminal.summary,
      terminal.version,
      surface.error,
    ],
  );
  const log = useMemo(() => {
    const clean = formatFlashOutput(sessionBuffer);
    return clean.length > 16_000 ? `…\n${clean.slice(-16_000)}` : clean;
  }, [sessionBuffer]);
  const isFailed = progress.stage === "failed";
  const isComplete = progress.stage === "complete";

  return (
    <section className="flex h-full min-h-0 flex-col bg-background" aria-label="Device Lab">
      <div className="shrink-0 border-b border-border/70 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Usb aria-hidden="true" className="size-3.5" />
              <span className="truncate">{surface.boardName}</span>
              <span aria-hidden="true">·</span>
              <span>{surface.portDisplayName}</span>
            </div>
            <p
              className="mt-1 truncate font-mono text-[10px] text-muted-foreground/70"
              title={surface.workspacePath}
            >
              Workspace: {surface.workspacePath}
            </p>
            <div className="mt-2 flex items-center gap-2" aria-live="polite">
              {isFailed ? (
                <XCircle aria-hidden="true" className="size-5 text-destructive" />
              ) : isComplete ? (
                <CheckCircle2 aria-hidden="true" className="size-5 text-emerald-500" />
              ) : (
                <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-primary" />
              )}
              <h2 className="text-base font-semibold text-foreground">
                {statusTitle(progress.stage)}
              </h2>
              {progress.percent !== null ? (
                <span className="ml-auto font-mono text-sm tabular-nums text-foreground">
                  {progress.percent}%
                </span>
              ) : null}
            </div>
          </div>
          <span className="rounded-full border border-border/70 bg-muted/40 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {surface.toolchain === "platformio" ? "PlatformIO" : "Arduino CLI"}
          </span>
        </div>

        <progress
          aria-label="Firmware flash progress"
          className={cn(
            "mt-4 h-2 w-full appearance-none overflow-hidden rounded-full bg-muted",
            "[&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary",
            "[&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted",
            "[&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary",
            isFailed &&
              "[&::-moz-progress-bar]:bg-destructive [&::-webkit-progress-value]:bg-destructive",
            isComplete &&
              "[&::-moz-progress-bar]:bg-emerald-500 [&::-webkit-progress-value]:bg-emerald-500",
          )}
          max={100}
          {...(progress.percent === null ? {} : { value: progress.percent })}
        />

        <div className="mt-4 grid grid-cols-3 gap-2">
          {FLASH_PHASES.map((phase, index) => (
            <div
              key={phase.stage}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <PhaseIcon phase={index} current={progress.stage} />
              <span>{phase.label}</span>
            </div>
          ))}
        </div>
        <p
          className={cn(
            "mt-4 truncate text-xs text-muted-foreground",
            isFailed && "text-destructive",
          )}
          title={progress.detail}
        >
          {progress.detail}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-9 shrink-0 items-center justify-between border-b border-border/60 px-4">
          <span className="text-xs font-medium text-muted-foreground">Flash output</span>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onOpenTerminal}
          >
            <TerminalSquare aria-hidden="true" className="size-3.5" />
            Open terminal
          </button>
        </div>
        <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[11px] leading-5 text-muted-foreground">
          {log || "Waiting for toolchain output…"}
        </pre>
      </div>
    </section>
  );
}
