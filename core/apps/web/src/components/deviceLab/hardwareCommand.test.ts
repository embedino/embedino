import { describe, expect, it } from "vite-plus/test";

import {
  arduinoSketchDirectory,
  hardwareExecutableInvocation,
  quoteHardwareShellArgument,
} from "./hardwareCommand";

describe("hardware command construction", () => {
  it("uses PowerShell's call operator for a resolved Windows executable", () => {
    expect(
      hardwareExecutableInvocation({
        resolvedPath: "C:\\Users\\Rapid User\\Python\\Scripts\\pio.exe",
        fallbackCommand: "pio",
        hostOs: "windows",
      }),
    ).toBe("& 'C:\\Users\\Rapid User\\Python\\Scripts\\pio.exe'");
  });

  it("quotes a resolved POSIX executable without a PowerShell operator", () => {
    expect(
      hardwareExecutableInvocation({
        resolvedPath: "/home/rapid/.local/bin/pio",
        fallbackCommand: "pio",
        hostOs: "linux",
      }),
    ).toBe("'/home/rapid/.local/bin/pio'");
  });

  it("keeps PATH commands bare and escapes PowerShell apostrophes", () => {
    expect(
      hardwareExecutableInvocation({
        resolvedPath: null,
        fallbackCommand: "arduino-cli",
        hostOs: "windows",
      }),
    ).toBe("arduino-cli");
    expect(quoteHardwareShellArgument("C:\\Users\\O'Brien\\pio.exe", "windows")).toBe(
      "'C:\\Users\\O''Brien\\pio.exe'",
    );
  });

  it("builds an Arduino sketch directory with cross-platform separators", () => {
    expect(arduinoSketchDirectory("Blink/Blink.ino")).toBe("./Blink");
    expect(arduinoSketchDirectory("Blink\\Blink.ino")).toBe("./Blink");
    expect(arduinoSketchDirectory("Blink.ino")).toBe(".");
  });
});
