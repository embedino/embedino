import { describe, expect, it } from "@effect/vitest";

import { parseWindowsDevices } from "./DeviceService.ts";

describe("parseWindowsDevices", () => {
  it("parses USB serial ports returned by Get-PnpDevice", () => {
    const devices = parseWindowsDevices(
      JSON.stringify({
        Name: "USB-SERIAL CH340 (COM7)",
        DeviceID: "USB\\VID_1A86&PID_7523\\ABC",
        Manufacturer: "wch.cn",
      }),
    );

    expect(devices).toHaveLength(1);
    expect(devices[0]).toMatchObject({
      port: "COM7",
      vid: "1a86",
      pid: "7523",
      manufacturer: "wch.cn",
    });
  });

  it("keeps serial ports that do not expose USB VID/PID metadata", () => {
    const devices = parseWindowsDevices(
      JSON.stringify({
        Name: "Communications Port (COM1)",
        DeviceID: "ACPI\\PNP0501\\0",
        Manufacturer: "Standard port types",
      }),
    );

    expect(devices).toHaveLength(1);
    expect(devices[0]).toMatchObject({
      id: "unknown:unknown:COM1",
      port: "COM1",
      vid: null,
      pid: null,
      status: "generic",
    });
  });
});
