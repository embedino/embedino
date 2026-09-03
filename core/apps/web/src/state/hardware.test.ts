import { describe, expect, it } from "vite-plus/test";
import type { HardwareDevice } from "@embedino/contracts";
import { initialHardwareState, reconcileHardwareSnapshot, type HardwareState } from "./hardware";

const device = (overrides: Partial<HardwareDevice> = {}): HardwareDevice => ({
  id: "239a:80cb:ADA123",
  port: "COM7",
  portDisplayName: "COM7",
  vid: "239a",
  pid: "80cb",
  usbSerialNumber: "ADA123",
  manufacturer: "Adafruit",
  boardName: "Adafruit QT Py",
  fqbn: "adafruit:samd:adafruit_qtpy_m0",
  pioBoard: "adafruit_qtpy_m0",
  driverChip: null,
  status: "identified",
  ...overrides,
});

describe("reconcileHardwareSnapshot", () => {
  it("refreshes a selected board name instead of preserving stale COM-port state", () => {
    const current: HardwareState = {
      ...initialHardwareState,
      activeDeviceId: "239a:80cb:ADA123",
      targetBoardName: "ESP32-S3 Dev Module",
      targetPortDisplay: "COM7",
      isOnline: true,
    };

    expect(reconcileHardwareSnapshot(current, [device()])).toMatchObject({
      activeDeviceId: "239a:80cb:ADA123",
      targetBoardName: "Adafruit QT Py",
      targetPortDisplay: "COM7",
      isOnline: true,
    });
  });

  it("selects the sole replacement when Windows reuses the old COM port", () => {
    const current: HardwareState = {
      ...initialHardwareState,
      activeDeviceId: "10c4:ea60:ESP456",
      targetBoardName: "ESP32-S3 Dev Module",
      targetPortDisplay: "COM7",
      isOnline: true,
    };

    expect(reconcileHardwareSnapshot(current, [device()])).toMatchObject({
      activeDeviceId: "239a:80cb:ADA123",
      targetBoardName: "Adafruit QT Py",
      isOnline: true,
    });
  });
});
