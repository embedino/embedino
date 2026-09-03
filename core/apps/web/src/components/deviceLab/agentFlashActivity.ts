import type { WorkLogEntry } from "~/session-logic";

export interface AgentFlashActivity {
  readonly entry: WorkLogEntry;
  readonly key: string;
  readonly toolchain: "platformio" | "arduino";
}

const PLATFORMIO_COMMAND_PATTERN = /(?:^|[\s"'\\/])(?:pio|platformio)(?:\.exe)?["']?\s+run\b/i;
const PLATFORMIO_UPLOAD_TARGET_PATTERN = /(?:--target|-t)\s+(?:upload|program)\b/i;
const ARDUINO_CLI_PATTERN = /(?:^|[\s"'\\/])arduino-cli(?:\.exe)?["']?(?:\s|$)/i;
const ARDUINO_UPLOAD_PATTERN = /(?:\bcompile\b[\s\S]*--upload\b|\bupload\b)/i;

export function agentFlashActivityKey(entry: WorkLogEntry): string {
  return entry.toolCallId ?? `${entry.turnId ?? "turn"}:${entry.command ?? entry.id}`;
}

export function detectAgentFlashActivity(entry: WorkLogEntry): AgentFlashActivity | null {
  const command = entry.command?.trim();
  if (!command) return null;

  const toolchain =
    PLATFORMIO_COMMAND_PATTERN.test(command) && PLATFORMIO_UPLOAD_TARGET_PATTERN.test(command)
      ? "platformio"
      : ARDUINO_CLI_PATTERN.test(command) && ARDUINO_UPLOAD_PATTERN.test(command)
        ? "arduino"
        : null;
  return toolchain === null ? null : { entry, key: agentFlashActivityKey(entry), toolchain };
}

export function findLatestActiveAgentFlash(
  entries: ReadonlyArray<WorkLogEntry>,
): AgentFlashActivity | null {
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    if (!entry || entry.toolLifecycleStatus !== "inProgress") continue;
    const detected = detectAgentFlashActivity(entry);
    if (detected) return detected;
  }
  return null;
}

export function agentFlashSessionState(
  command: string,
  activity: WorkLogEntry | null,
): {
  readonly buffer: string;
  readonly status: "starting" | "running" | "exited" | "error";
  readonly error: string | null;
  readonly hasRunningSubprocess: boolean;
} {
  const lifecycle = activity?.toolLifecycleStatus;
  const failed = lifecycle === "failed" || lifecycle === "declined" || lifecycle === "stopped";
  const status = failed
    ? "error"
    : lifecycle === "completed"
      ? "exited"
      : activity === null
        ? "starting"
        : "running";
  const detail = activity?.detail?.trim();
  return {
    buffer: [command.trim(), detail]
      .filter((value): value is string => Boolean(value))
      .join("\n\n"),
    status,
    error: failed ? (detail ?? "The agent flash command did not complete.") : null,
    hasRunningSubprocess: lifecycle === "inProgress",
  };
}
