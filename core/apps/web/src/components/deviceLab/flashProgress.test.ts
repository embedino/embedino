import { describe, expect, it } from "vite-plus/test";

import { deriveFlashProgress, formatFlashOutput } from "./flashProgress";

const base = {
  hasRunningSubprocess: true,
  terminalStatus: "running" as const,
  terminalError: null,
};

describe("deriveFlashProgress", () => {
  it("removes terminal title sequences and collapses screen-sized blank regions", () => {
    expect(
      formatFlashOutput(
        `\u001B]0;C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe\u0007PS C:\\work>\r\n\r\n\r\nProcessing esp32\r\n\r\n\r\nWriting at 0x00010000... (47 %)\r\n`,
      ),
    ).toBe("PS C:\\work>\n\nProcessing esp32\n\nWriting at 0x00010000... (47 %)");
  });

  it("does not mistake PlatformIO memory usage for upload progress", () => {
    expect(
      deriveFlashProgress({ ...base, buffer: "RAM: [==        ] 20.4%\nProcessing esp32dev" }),
    ).toMatchObject({ stage: "building", percent: null });
  });

  it("reads a real esptool upload percentage", () => {
    expect(
      deriveFlashProgress({
        ...base,
        buffer: "Uploading .pio/build/firmware.bin\nWriting at 0x00010000... (47 %)\n",
      }),
    ).toMatchObject({ stage: "uploading", percent: 47 });
  });

  it("reports verification and completion", () => {
    expect(
      deriveFlashProgress({
        ...base,
        buffer: "avrdude: writing flash (100%)\navrdude: verifying ...\n",
      }),
    ).toMatchObject({ stage: "verifying", percent: 100 });
    expect(deriveFlashProgress({ ...base, buffer: "avrdude done.  Thank you.\n" })).toMatchObject({
      stage: "complete",
      percent: 100,
    });
    expect(
      deriveFlashProgress({
        ...base,
        buffer: "Agent command completed without a toolchain success marker.",
        hasRunningSubprocess: false,
        terminalStatus: "exited",
      }),
    ).toMatchObject({ stage: "complete", percent: 100 });
  });

  it("surfaces compiler and upload failures", () => {
    expect(
      deriveFlashProgress({ ...base, buffer: "src/main.cpp:12:4: error: expected ';'\n" }),
    ).toMatchObject({ stage: "failed", percent: null });
  });
});
