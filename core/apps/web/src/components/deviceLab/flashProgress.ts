export type FlashStage =
  | "preparing"
  | "building"
  | "uploading"
  | "verifying"
  | "complete"
  | "failed";

export interface FlashProgress {
  readonly stage: FlashStage;
  readonly percent: number | null;
  readonly detail: string;
}

const ANSI_CSI_PATTERN = new RegExp(`${String.fromCodePoint(27)}\\[[0-?]*[ -/]*[@-~]`, "g");
const ANSI_OSC_PATTERN = new RegExp(
  `${String.fromCodePoint(27)}\\][^${String.fromCodePoint(7)}${String.fromCodePoint(27)}]*(?:${String.fromCodePoint(7)}|${String.fromCodePoint(27)}\\\\)`,
  "g",
);
const UPLOAD_MARKERS = [
  "uploading",
  "avrdude",
  "esptool",
  "writing at 0x",
  "writing flash",
  "upload_port",
] as const;

export function stripTerminalControlSequences(value: string): string {
  return value.replace(ANSI_OSC_PATTERN, "").replace(ANSI_CSI_PATTERN, "").replace(/\r/g, "");
}

/**
 * Terminal history includes shell startup control traffic and screen-sized
 * blank regions that are useful to a terminal emulator but noisy in the
 * Device Lab log. Preserve tool output while keeping the inline view compact.
 */
export function formatFlashOutput(value: string): string {
  const lines = stripTerminalControlSequences(value)
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""));
  const compact: string[] = [];
  for (const line of lines) {
    if (line.length === 0 && (compact.length === 0 || compact.at(-1) === "")) continue;
    compact.push(line);
  }
  while (compact.at(-1) === "") compact.pop();
  return compact.join("\n");
}

function findUploadStart(output: string): number {
  const lower = output.toLowerCase();
  return UPLOAD_MARKERS.reduce((earliest, marker) => {
    const index = lower.indexOf(marker);
    if (index < 0) return earliest;
    return earliest < 0 ? index : Math.min(earliest, index);
  }, -1);
}

function findUploadPercent(output: string, uploadStart: number): number | null {
  if (uploadStart < 0) return null;
  const uploadOutput = output.slice(uploadStart);
  const matches = uploadOutput.matchAll(/(?:\(|\b)(\d{1,3})(?:\.\d+)?\s*%/g);
  let latest: number | null = null;
  for (const match of matches) {
    const value = Number(match[1]);
    if (Number.isFinite(value) && value >= 0 && value <= 100) latest = value;
  }
  return latest;
}

function lastMeaningfulLine(output: string): string | null {
  const lines = output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^[A-Za-z]:\\.*[>\u276f]\s*$/.test(line));
  return lines.at(-1) ?? null;
}

export function deriveFlashProgress(input: {
  readonly buffer: string;
  readonly hasRunningSubprocess: boolean;
  readonly terminalStatus: "starting" | "running" | "exited" | "error" | "closed";
  readonly terminalError: string | null;
}): FlashProgress {
  const output = stripTerminalControlSequences(input.buffer);
  const lower = output.toLowerCase();
  const detail = lastMeaningfulLine(output);

  const failed =
    input.terminalStatus === "error" ||
    input.terminalError !== null ||
    /(?:\[failed\]|failed uploading|upload error|avrdude:\s*error|fatal error:|error:\s)/i.test(
      output,
    );
  if (failed) {
    return {
      stage: "failed",
      percent: null,
      detail: input.terminalError ?? detail ?? "Flashing failed.",
    };
  }

  const complete =
    /\[success\]|avrdude done|hash of data verified|hard resetting via rts pin|upload complete/i.test(
      output,
    ) ||
    (input.terminalStatus === "exited" && output.trim().length > 0);
  if (complete) {
    return { stage: "complete", percent: 100, detail: detail ?? "Flash completed." };
  }

  const uploadStart = findUploadStart(output);
  const percent = findUploadPercent(output, uploadStart);
  const verifying =
    uploadStart >= 0 &&
    /verifying|verified|reading on-chip flash|leaving\.\.\./i.test(output.slice(uploadStart));
  if (verifying) {
    return { stage: "verifying", percent, detail: detail ?? "Verifying firmware…" };
  }
  if (uploadStart >= 0) {
    return { stage: "uploading", percent, detail: detail ?? "Uploading firmware…" };
  }

  if (lower.includes("processing ") || lower.includes("compiling") || input.hasRunningSubprocess) {
    return { stage: "building", percent: null, detail: detail ?? "Building firmware…" };
  }
  return { stage: "preparing", percent: null, detail: detail ?? "Preparing flash session…" };
}
