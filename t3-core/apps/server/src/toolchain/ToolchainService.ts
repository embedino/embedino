// @effect-diagnostics nodeBuiltinImport:off globalTimersInEffect:off globalDate:off globalFetch:off
import {
  ToolchainInstallProgressEvent,
  ToolchainInstallError,
  ToolchainStatus,
} from "@t3tools/contracts";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Queue from "effect/Queue";
import * as NodeChildProcess from "node:child_process";
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";
import * as NodeOS from "node:os";

// ---------------------------------------------------------------------------
// Dynamic Toolchain Discovery — filesystem scanning with zero process overhead
// ---------------------------------------------------------------------------

function resolvePythonCommand(): string {
  const localAppData = process.env.LOCALAPPDATA || "";

  // Check dynamic Python directory scans
  for (const base of [NodePath.join(localAppData, "Programs", "Python"), "C:\\"]) {
    try {
      if (NodeFS.existsSync(base)) {
        for (const entry of NodeFS.readdirSync(base)) {
          if (entry.toLowerCase().startsWith("python")) {
            const exe = NodePath.join(base, entry, "python.exe");
            if (NodeFS.existsSync(exe)) return exe;
          }
        }
      }
    } catch {}
  }

  return "python";
}

function findPio(): { installed: boolean; version: string | null } {
  const userProfile = process.env.USERPROFILE || "";
  const appData = process.env.APPDATA || "";
  const localAppData = process.env.LOCALAPPDATA || "";

  const candidates: string[] = [];

  // 1. Scan PATH entries
  const pathDirs = (process.env.PATH || "").split(NodePath.delimiter);
  for (const dir of pathDirs) {
    if (dir.trim()) {
      candidates.push(NodePath.join(dir.trim(), "pio.exe"));
      candidates.push(NodePath.join(dir.trim(), "pio"));
    }
  }

  // 2. Scan PlatformIO Core virtual environment
  candidates.push(NodePath.join(userProfile, ".platformio", "penv", "Scripts", "pio.exe"));
  candidates.push(NodePath.join(userProfile, ".platformio", "penv", "bin", "pio"));

  // 3. Dynamically scan APPDATA/Python/Python*/Scripts
  try {
    const pyDir = NodePath.join(appData, "Python");
    if (NodeFS.existsSync(pyDir)) {
      for (const entry of NodeFS.readdirSync(pyDir)) {
        candidates.push(NodePath.join(pyDir, entry, "Scripts", "pio.exe"));
      }
    }
  } catch {}

  // 4. Dynamically scan LOCALAPPDATA/Programs/Python/Python*/Scripts
  try {
    const pyProgDir = NodePath.join(localAppData, "Programs", "Python");
    if (NodeFS.existsSync(pyProgDir)) {
      for (const entry of NodeFS.readdirSync(pyProgDir)) {
        candidates.push(NodePath.join(pyProgDir, entry, "Scripts", "pio.exe"));
      }
    }
  } catch {}

  // 5. Dynamically scan C:\Python*\Scripts
  try {
    const rootEntries = NodeFS.readdirSync("C:\\");
    for (const entry of rootEntries) {
      if (entry.toLowerCase().startsWith("python")) {
        candidates.push(NodePath.join("C:\\", entry, "Scripts", "pio.exe"));
      }
    }
  } catch {}

  for (const candidate of candidates) {
    try {
      if (NodeFS.existsSync(candidate)) {
        return { installed: true, version: `PlatformIO (${candidate})` };
      }
    } catch {}
  }

  return { installed: false, version: null };
}

function findArduinoCli(): { installed: boolean; version: string | null } {
  const userProfile = process.env.USERPROFILE || "";
  const localAppData = process.env.LOCALAPPDATA || "";
  const programFiles = process.env.ProgramFiles || "C:\\Program Files";

  const candidates: string[] = [];

  // 1. Scan PATH entries
  const pathDirs = (process.env.PATH || "").split(NodePath.delimiter);
  for (const dir of pathDirs) {
    if (dir.trim()) {
      candidates.push(NodePath.join(dir.trim(), "arduino-cli.exe"));
      candidates.push(NodePath.join(dir.trim(), "arduino-cli"));
    }
  }

  // 2. Scan Standard Install Locations
  candidates.push(NodePath.join(userProfile, "bin", "arduino-cli.exe"));
  candidates.push(NodePath.join(userProfile, ".arduino", "arduino-cli.exe"));
  candidates.push(NodePath.join(localAppData, "Arduino15", "arduino-cli.exe"));
  candidates.push(NodePath.join(programFiles, "Arduino CLI", "arduino-cli.exe"));

  for (const candidate of candidates) {
    try {
      if (NodeFS.existsSync(candidate)) {
        return { installed: true, version: `Arduino CLI (${candidate})` };
      }
    } catch {}
  }

  return { installed: false, version: null };
}

export const getToolchainStatus = (): Effect.Effect<ToolchainStatus, ToolchainInstallError> => {
  return Effect.try({
    try: () => {
      const pio = findPio();
      const arduino = findArduinoCli();

      return {
        platformioInstalled: pio.installed,
        platformioVersion: pio.version,
        arduinoInstalled: arduino.installed,
        arduinoVersion: arduino.version,
      } satisfies ToolchainStatus;
    },
    catch: (e) => new ToolchainInstallError({ message: `Status check failed: ${e}` }),
  });
};

// ---------------------------------------------------------------------------
// Async Installers with Real Streaming Feedback
// ---------------------------------------------------------------------------

async function installArduinoCliAsync(
  emit: (event: ToolchainInstallProgressEvent) => void,
): Promise<void> {
  emit({
    type: "progress",
    progress: 5,
    stdout: "Connecting to Arduino release repository...\n",
  });

  const url = "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip";
  const tempZip = NodePath.join(NodeOS.tmpdir(), `arduino-cli-${Date.now()}.zip`);
  const destDir = NodePath.join(process.env.USERPROFILE || "", "bin");

  if (!NodeFS.existsSync(destDir)) {
    NodeFS.mkdirSync(destDir, { recursive: true });
  }

  emit({
    type: "progress",
    progress: 10,
    stdout: `Downloading Arduino CLI package from ${url}...\n`,
  });

  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Download failed: HTTP ${response.status} ${response.statusText}`);
  }

  const contentLength = Number(response.headers.get("content-length")) || 18000000;
  let receivedBytes = 0;
  let lastProgress = 10;

  const fileStream = NodeFS.createWriteStream(tempZip);
  const reader = response.body.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fileStream.write(Buffer.from(value));
    receivedBytes += value.length;
    const progress = Math.min(65, Math.max(10, Math.floor((receivedBytes / contentLength) * 65)));
    if (progress > lastProgress) {
      lastProgress = progress;
      const mb = Math.round((receivedBytes / 1024 / 1024) * 10) / 10;
      const totalMb = Math.round((contentLength / 1024 / 1024) * 10) / 10;
      emit({
        type: "progress",
        progress,
        stdout: `Downloading Arduino CLI: ${mb}MB / ${totalMb}MB (${progress}%)\n`,
      });
    }
  }

  await new Promise<void>((resolve, reject) => {
    fileStream.end((err?: Error | null) => {
      if (err) reject(err);
      else resolve();
    });
  });

  emit({
    type: "progress",
    progress: 70,
    stdout: "Extracting Arduino CLI executable to user bin...\n",
  });

  // Extract using Windows native tar
  await new Promise<void>((resolve, reject) => {
    const child = NodeChildProcess.spawn("tar", ["-xf", tempZip, "-C", destDir], {
      windowsHide: true,
    });
    child.on("error", (err) => reject(new Error(`Failed to extract archive: ${err.message}`)));
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Extraction failed with exit code ${code}`));
    });
  });

  // Clean up temp archive
  try {
    if (NodeFS.existsSync(tempZip)) NodeFS.unlinkSync(tempZip);
  } catch {}

  emit({
    type: "progress",
    progress: 90,
    stdout: "Verifying Arduino CLI installation...\n",
  });

  const verified = findArduinoCli();
  if (!verified.installed) {
    const exePath = NodePath.join(destDir, "arduino-cli.exe");
    if (!NodeFS.existsSync(exePath)) {
      throw new Error(
        "Installation finished but arduino-cli.exe was not found in destination directory.",
      );
    }
  }

  emit({
    type: "progress",
    progress: 100,
    stdout: "Arduino CLI installed successfully!\n",
  });
}

async function installPlatformioAsync(
  emit: (event: ToolchainInstallProgressEvent) => void,
): Promise<void> {
  emit({
    type: "progress",
    progress: 5,
    stdout: "Resolving Python interpreter on system...\n",
  });

  const pythonCmd = resolvePythonCommand();

  emit({
    type: "progress",
    progress: 10,
    stdout: `Using Python interpreter (${pythonCmd}) to install PlatformIO via pip...\n`,
  });

  await new Promise<void>((resolve, reject) => {
    const child = NodeChildProcess.spawn(
      pythonCmd,
      ["-u", "-m", "pip", "install", "--upgrade", "platformio"],
      {
        windowsHide: true,
      },
    );

    let currentProgress = 15;

    const handleOutput = (data: Buffer) => {
      const text = data.toString();
      const lower = text.toLowerCase();

      if (lower.includes("requirement already satisfied")) {
        currentProgress = Math.max(currentProgress, 90);
      } else if (lower.includes("collecting")) {
        currentProgress = Math.max(currentProgress, 30);
      } else if (lower.includes("downloading") || lower.includes("using cached")) {
        currentProgress = Math.max(currentProgress, 55);
      } else if (lower.includes("installing collected") || lower.includes("uninstalling")) {
        currentProgress = Math.max(currentProgress, 80);
      } else if (lower.includes("successfully installed")) {
        currentProgress = 95;
      }

      emit({
        type: "progress",
        progress: currentProgress,
        stdout: text,
      });
    };

    child.stdout?.on("data", handleOutput);
    child.stderr?.on("data", handleOutput);

    child.on("error", (err) => {
      reject(
        new Error(
          `Failed to launch Python (${pythonCmd}): ${err.message}. Please ensure Python 3 is installed.`,
        ),
      );
    });

    child.on("close", (code) => {
      if (code === 0) {
        emit({
          type: "progress",
          progress: 100,
          stdout: "PlatformIO installed successfully!\n",
        });
        resolve();
      } else {
        reject(new Error(`PlatformIO pip installation failed with exit code ${code}`));
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Install toolchain — streams progress events to client
// ---------------------------------------------------------------------------

const installToolchainInternal = (
  toolchain: "platformio" | "arduino",
): Stream.Stream<ToolchainInstallProgressEvent, ToolchainInstallError> => {
  return Stream.callback<ToolchainInstallProgressEvent, ToolchainInstallError>((queue) => {
    let cancelled = false;

    const emit = (event: ToolchainInstallProgressEvent) => {
      if (cancelled) return;
      Effect.runPromise(Queue.offer(queue, event)).catch(() => {});
    };

    const done = () => {
      if (cancelled) return;
      Effect.runPromise(Queue.end(queue)).catch(() => {});
    };

    const fail = (err: ToolchainInstallError) => {
      if (cancelled) return;
      Effect.runPromise(Queue.fail(queue, err)).catch(() => {});
    };

    void (async () => {
      try {
        if (toolchain === "arduino") {
          await installArduinoCliAsync(emit);
        } else {
          await installPlatformioAsync(emit);
        }
        done();
      } catch (err: any) {
        fail(new ToolchainInstallError({ message: err?.message ?? String(err) }));
      }
    })();

    return Effect.acquireRelease(Effect.void, () =>
      Effect.sync(() => {
        cancelled = true;
      }),
    );
  });
};

export const installToolchainPlatformio = () => installToolchainInternal("platformio");
export const installToolchainArduino = () => installToolchainInternal("arduino");
