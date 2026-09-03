import { describe, expect, it } from "vite-plus/test";
import { findAssociationIn, type StoredAssociation } from "./DeviceAssociationStore.ts";

const associations: readonly StoredAssociation[] = [
  { vid: "10c4", pid: "ea60", boardName: "Legacy ESP32" },
  {
    vid: "10c4",
    pid: "ea60",
    usbSerialNumber: "ESP-001",
    boardName: "ESP32-S3 Matrix Portal",
  },
  {
    vid: "10c4",
    pid: "ea60",
    usbSerialNumber: "ADA-002",
    boardName: "Adafruit board",
  },
];

describe("findAssociationIn", () => {
  it("matches a saved name to the exact USB serial", () => {
    expect(findAssociationIn(associations, "10C4", "EA60", "ADA-002")?.boardName).toBe(
      "Adafruit board",
    );
  });

  it("does not apply a legacy VID/PID-only name to a serial-numbered device", () => {
    expect(findAssociationIn(associations, "10c4", "ea60", "NEW-BOARD")).toBeNull();
  });

  it("keeps legacy matching only for devices without an instance serial", () => {
    expect(findAssociationIn(associations, "10c4", "ea60")?.boardName).toBe("Legacy ESP32");
  });
});
