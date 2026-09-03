import { describe, expect, it } from "@effect/vitest";

import { parseWindowsDevices, windowsUsbSerialNumber } from "./DeviceService.ts";

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
      usbSerialNumber: "ABC",
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
      usbSerialNumber: null,
      status: "generic",
    });
  });

  it("keeps same-port USB devices distinct by their PnP instance serial", () => {
    const first = parseWindowsDevices(
      JSON.stringify({
        Name: "USB Serial Device (COM9)",
        DeviceID: "USB\\VID_239A&PID_80CB\\ADA123",
      }),
    )[0];
    const second = parseWindowsDevices(
      JSON.stringify({
        Name: "Silicon Labs CP210x (COM9)",
        DeviceID: "USB\\VID_10C4&PID_EA60\\ESP456",
      }),
    )[0];

    expect(first?.id).not.toBe(second?.id);
    expect(first?.boardName).toBe("Adafruit QT Py");
    expect(second?.usbSerialNumber).toBe("ESP456");
  });

  it.each(["8125", "0125", "8126"])(
    "recognizes the MatrixPortal S3 USB identity 239a:%s",
    (pid) => {
      const [matrixPortal] = parseWindowsDevices(
        JSON.stringify({
          Name: "Adafruit MatrixPortal ESP32-S3 (COM6)",
          DeviceID: `USB\\VID_239A&PID_${pid}\\MATRIX-001`,
          Manufacturer: "Adafruit",
        }),
      );

      expect(matrixPortal).toMatchObject({
        boardName: "Adafruit MatrixPortal ESP32-S3",
        fqbn: "esp32:esp32:adafruit_matrixportal_esp32s3",
        pioBoard: "adafruit_matrixportal_esp32s3",
      });
    },
  );

  it("only extracts instance serials from USB PnP ids", () => {
    expect(windowsUsbSerialNumber("USB\\VID_239A&PID_80CB\\ADA123")).toBe("ADA123");
    expect(windowsUsbSerialNumber("ACPI\\PNP0501\\0")).toBeNull();
  });
});
