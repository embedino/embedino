import { describe, expect, it } from "vite-plus/test";

import type { WorkLogEntry } from "~/session-logic";

import {
  agentFlashSessionState,
  detectAgentFlashActivity,
  findLatestActiveAgentFlash,
} from "./agentFlashActivity";

function commandEntry(command: string, overrides: Partial<WorkLogEntry> = {}): WorkLogEntry {
  return {
    id: "activity-1",
    createdAt: "2026-09-02T10:00:00.000Z",
    label: "Ran command",
    tone: "tool",
    itemType: "command_execution",
    toolLifecycleStatus: "inProgress",
    command,
    ...overrides,
  };
}

describe("agent flash activity", () => {
  it("recognizes PlatformIO uploads through a resolved Windows executable", () => {
    expect(
      detectAgentFlashActivity(
        commandEntry("& 'C:\\Python\\Scripts\\pio.exe' run --target upload --upload-port COM4"),
      ),
    ).toMatchObject({ toolchain: "platformio" });
  });

  it("recognizes Arduino compile-and-upload commands", () => {
    expect(
      detectAgentFlashActivity(
        commandEntry("arduino-cli compile --upload -b esp32:esp32:esp32s3 -p COM4 ."),
      ),
    ).toMatchObject({ toolchain: "arduino" });
  });

  it("does not open Device Lab for ordinary builds or unrelated commands", () => {
    expect(detectAgentFlashActivity(commandEntry("pio run"))).toBeNull();
    expect(detectAgentFlashActivity(commandEntry("pnpm test"))).toBeNull();
  });

  it("selects only an in-progress flash and converts its lifecycle into panel state", () => {
    const completed = commandEntry("pio run --target upload", {
      id: "old",
      toolCallId: "call-old",
      toolLifecycleStatus: "completed",
    });
    const active = commandEntry("pio run -t upload", {
      id: "new",
      toolCallId: "call-new",
      detail: "Writing at 0x00010000... (47 %)",
    });
    expect(findLatestActiveAgentFlash([completed, active])?.key).toBe("call-new");
    expect(agentFlashSessionState(active.command!, active)).toMatchObject({
      status: "running",
      hasRunningSubprocess: true,
      error: null,
    });
    expect(
      agentFlashSessionState(active.command!, {
        ...active,
        toolLifecycleStatus: "completed",
      }),
    ).toMatchObject({ status: "exited", hasRunningSubprocess: false });
  });
});
