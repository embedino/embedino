// @effect-diagnostics nodeBuiltinImport:off globalTimers:off tryCatchInEffectGen:off globalDate:off globalFetch:off
import {
  HardwareDevice,
  HardwareEvent,
  DeviceAssociationInput,
  HardwareDetectionError,
} from "@embedino/contracts";
import { HostProcessPlatform } from "@embedino/shared/hostProcess";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Queue from "effect/Queue";
import * as NodeChildProcess from "node:child_process";
import * as NodeFS from "node:fs";
import * as NodeUtil from "node:util";
import { lookupByVidPid, lookupBridgeChip } from "./BoardDatabase.ts";

const execFileAsync = NodeUtil.promisify(NodeChildProcess.execFile);
import {
  findAssociation,
  saveAssociation,
  type StoredAssociation,
} from "./DeviceAssociationStore.ts";

function normalizePortDisplayName(port: string): string {
  if (port.startsWith("/dev/cu.")) return port.slice(8);
  if (port.startsWith("/dev/tty.")) return port.slice(9);
  if (port.startsWith("/dev/")) return port.slice(5);
  return port;
}

function parseWindowsDevices(jsonStr: string): HardwareDevice[] {
  try {
    const data = JSON.parse(jsonStr);
    const devices = Array.isArray(data) ? data : [data];
    const results: HardwareDevice[] = [];

    for (const dev of devices) {
      if (!dev.Name || !dev.DeviceID) continue;

      const portMatch = dev.Name.match(/(COM\d+)/);
      const vidPidMatch = dev.DeviceID.match(/VID_([0-9A-Fa-f]{4})&PID_([0-9A-Fa-f]{4})/);

      if (portMatch && vidPidMatch) {
        const port = portMatch[1];
        const vid = vidPidMatch[1].toLowerCase();
        const pid = vidPidMatch[2].toLowerCase();

        results.push(resolveDevice(port, vid, pid, dev.Manufacturer));
      }
    }
    return results;
  } catch {
    return [];
  }
}

function parseMacDevices(jsonStr: string): HardwareDevice[] {
  try {
    const data = JSON.parse(jsonStr);
    const results: HardwareDevice[] = [];

    function walk(node: any) {
      if (Array.isArray(node)) {
        node.forEach(walk);
      } else if (typeof node === "object" && node !== null) {
        if (node.vendor_id && node.product_id) {
          const vid = node.vendor_id.replace(/^0x/, "").toLowerCase();
          const pid = node.product_id.replace(/^0x/, "").toLowerCase();

          if (node.serial_num) {
            // macOS typically lists the bsd_name if it's a serial port
            if (node.bsd_name) {
              const port = `/dev/${node.bsd_name}`;
              results.push(resolveDevice(port, vid, pid, node.manufacturer));
            } else {
              // We could look in /dev for tty.* but let's assume one is enough for now or it matches later
            }
          }
        }
        for (const key in node) {
          walk(node[key]);
        }
      }
    }

    walk(data);
    return results;
  } catch {
    return [];
  }
}

function resolveDevice(
  port: string,
  vid: string,
  pid: string,
  manufacturer?: string,
): HardwareDevice {
  const portDisplayName = normalizePortDisplayName(port);
  const driverChip = lookupBridgeChip(vid, pid);

  // Check user-saved associations first
  const assoc = findAssociation(vid, pid);
  if (assoc) {
    return {
      id: `${vid}:${pid}:${port}`,
      port,
      portDisplayName,
      vid,
      pid,
      manufacturer: manufacturer ?? null,
      boardName: assoc.boardName,
      fqbn: assoc.fqbn ?? null,
      pioBoard: assoc.pioBoard ?? null,
      driverChip,
      status: "identified",
    };
  }

  // Tier 1: Instant VID/PID lookup
  const board = lookupByVidPid(vid, pid);
  if (board) {
    return {
      id: `${vid}:${pid}:${port}`,
      port,
      portDisplayName,
      vid,
      pid,
      manufacturer: manufacturer ?? board.vendor,
      boardName: board.name,
      fqbn: board.fqbn ?? null,
      pioBoard: board.pioBoard ?? null,
      driverChip,
      status: "identified",
    };
  }

  // Tier 3: Generic bridge or fully unknown
  if (driverChip) {
    return {
      id: `${vid}:${pid}:${port}`,
      port,
      portDisplayName,
      vid,
      pid,
      manufacturer: manufacturer ?? null,
      boardName: null,
      fqbn: null,
      pioBoard: null,
      driverChip,
      status: "generic",
    };
  }

  return {
    id: `${vid}:${pid}:${port}`,
    port,
    portDisplayName,
    vid,
    pid,
    manufacturer: manufacturer ?? null,
    boardName: null,
    fqbn: null,
    pioBoard: null,
    driverChip: null,
    status: "generic",
  };
}

export const scanDevices = () =>
  Effect.gen(function* () {
    const platform = yield* HostProcessPlatform;

    if (platform === "win32") {
      try {
        const result = yield* Effect.promise(() =>
          execFileAsync(
            "powershell.exe",
            [
              "-NoProfile",
              "-Command",
              `Get-CimInstance Win32_PnPEntity | Where-Object -Property Name -Match 'COM\\d+' | Where-Object -Property Present -eq $true | Select-Object Name, DeviceID, Manufacturer | ConvertTo-Json`,
            ],
            { encoding: "utf-8", timeout: 5000 },
          ),
        );
        if (result.stderr && result.stderr.trim().length > 0) {
          yield* Effect.logError(`Device scan stderr (win32): ${result.stderr}`);
        }
        return parseWindowsDevices(result.stdout);
      } catch (err) {
        yield* Effect.logError(`Device scan failed (win32): ${err}`);
        return [];
      }
    } else if (platform === "darwin") {
      try {
        const result = yield* Effect.promise(() =>
          execFileAsync("system_profiler", ["SPUSBDataType", "-json"], {
            encoding: "utf-8",
            timeout: 5000,
          }),
        );
        if (result.stderr && result.stderr.trim().length > 0) {
          yield* Effect.logError(`Device scan stderr (darwin): ${result.stderr}`);
        }
        return parseMacDevices(result.stdout);
      } catch (err) {
        yield* Effect.logError(`Device scan failed (darwin): ${err}`);
        return [];
      }
    } else {
      // Linux
      const devices: HardwareDevice[] = [];
      try {
        const ttyFiles = NodeFS.readdirSync("/sys/class/tty/");
        for (const tty of ttyFiles) {
          try {
            const devicePath = `/sys/class/tty/${tty}/device`;
            if (NodeFS.existsSync(devicePath)) {
              const vidPath = `${devicePath}/../idVendor`;
              const pidPath = `${devicePath}/../idProduct`;
              if (NodeFS.existsSync(vidPath) && NodeFS.existsSync(pidPath)) {
                const vid = NodeFS.readFileSync(vidPath, "utf-8").trim();
                const pid = NodeFS.readFileSync(pidPath, "utf-8").trim();
                devices.push(resolveDevice(`/dev/${tty}`, vid, pid));
              }
            }
          } catch {
            // Ignore
          }
        }
      } catch {
        // Ignore
      }
      return devices;
    }
  });

export const subscribeDevices = () =>
  Stream.fromEffect(
    Effect.gen(function* () {
      const platform = yield* HostProcessPlatform;
      return platform;
    }),
  ).pipe(
    Stream.flatMap((platform) =>
      Stream.callback<HardwareEvent, HardwareDetectionError>((queue) => {
        let cancelled = false;
        let watcher: NodeFS.FSWatcher | null = null;
        let timeout: NodeJS.Timeout | null = null;

        const emit = (event: HardwareEvent) => {
          if (cancelled) return;
          Effect.runPromise(Queue.offer(queue, event)).catch(() => {});
        };

        const doScan = () => {
          Effect.runPromise(scanDevices())
            .then((devices) => {
              if (cancelled) return;
              emit({ type: "snapshot", devices });
            })
            .catch((err) => {
              if (cancelled) return;
              Effect.runPromise(Effect.logError(`Device scan stream error: ${err}`)).catch(
                () => {},
              );
            })
            .finally(() => {
              if (cancelled) return;
              if (platform === "win32") {
                timeout = setTimeout(doScan, 2000);
                timeout.unref();
              }
            });
        };

        doScan();

        if (platform !== "win32") {
          try {
            watcher = NodeFS.watch("/dev/", (eventType, filename) => {
              if (!filename) return;
              if (
                filename.startsWith("ttyUSB") ||
                filename.startsWith("ttyACM") ||
                filename.startsWith("cu.usb")
              ) {
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(doScan, 300);
                timeout.unref();
              }
            });
          } catch {
            // Ignored
          }
        }

        return Effect.acquireRelease(Effect.void, () =>
          Effect.sync(() => {
            cancelled = true;
            if (timeout) {
              clearTimeout(timeout);
            }
            if (watcher) watcher.close();
          }),
        );
      }),
    ),
  );

export const setDeviceAssociation = (input: DeviceAssociationInput) =>
  Effect.gen(function* () {
    // Look up the device to get its VID/PID for persistent association
    const devices = yield* scanDevices();
    const device = devices.find((d) => d.id === input.deviceId);
    // An association row keyed by empty VID/PID can never match a scanned
    // device (the device vanished mid-association or carries no USB ids):
    // report the miss instead of persisting dead state as a success.
    if (!device || !device.vid || !device.pid) {
      return { success: false as const };
    }
    const assoc: StoredAssociation = {
      vid: device.vid,
      pid: device.pid,
      boardName: input.boardName,
      ...(input.fqbn ? { fqbn: input.fqbn } : {}),
      ...(input.pioBoard ? { pioBoard: input.pioBoard } : {}),
    };
    saveAssociation(assoc);
    return { success: true as const };
  });
