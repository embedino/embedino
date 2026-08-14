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
// Detect installed toolchains — instant filesystem checks, zero process spawning
// ---------------------------------------------------------------------------

function findPio(): { installed: boolean; version: string | null } {
  const appData = process.env.APPDATA || "";
  const localAppData = process.env.LOCALAPPDATA || "";
  const userProfile = process.env.USERPROFILE || "";

  // Check known pip user-script install locations (Windows)
  const pipPaths = [
    NodePath.join(appData, "Python", "Python314", "Scripts", "pio.exe"),
    NodePath.join(appData, "Python", "Python313", "Scripts", "pio.exe"),
    NodePath.join(appData, "Python", "Python312", "Scripts", "pio.exe"),
    NodePath.join(appData, "Python", "Python311", "Scripts", "pio.exe"),
    NodePath.join(appData, "Python", "Python310", "Scripts", "pio.exe"),
  ];

  // Also check global Python Scripts, venv, and PATH-adjacent locations
  const globalPaths = [
    NodePath.join(userProfile, ".platformio", "penv", "Scripts", "pio.exe"),
    NodePath.join(localAppData, "Programs", "Python", "Python314", "Scripts", "pio.exe"),
    NodePath.join(localAppData, "Programs", "Python", "Python313", "Scripts", "pio.exe"),
    NodePath.join(localAppData, "Programs", "Python", "Python312", "Scripts", "pio.exe"),
  ];

  // Check PATH entries
  const pathDirs = (process.env.PATH || "").split(";");
  const pathPioPaths = pathDirs.map((dir) => NodePath.join(dir, "pio.exe"));

  const allCandidates = [...pipPaths, ...globalPaths, ...pathPioPaths];

  for (const candidate of allCandidates) {
    try {
      if (NodeFS.existsSync(candidate)) {
        return { installed: true, version: `PlatformIO (${candidate})` };
      }
    } catch {
      // ignore permission errors
    }
  }

  return { installed: false, version: null };
}

function findArduinoCli(): { installed: boolean; version: string | null } {
  const localAppData = process.env.LOCALAPPDATA || "";
  const userProfile = process.env.USERPROFILE || "";

  const candidates = [
    NodePath.join(userProfile, "bin", "arduino-cli.exe"),
    NodePath.join(localAppData, "Arduino15", "arduino-cli.exe"),
    NodePath.join(userProfile, ".arduino", "arduino-cli.exe"),
    // Check PATH
    ...(process.env.PATH || "").split(";").map((dir) => NodePath.join(dir, "arduino-cli.exe")),
  ];

  for (const candidate of candidates) {
    try {
      if (NodeFS.existsSync(candidate)) {
        return { installed: true, version: `Arduino CLI (${candidate})` };
      }
    } catch {
      // ignore
    }
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
    // If not in standard path, check destDir explicitly
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
    stdout: "Starting PlatformIO installation via Python pip...\n",
  });

  await new Promise<void>((resolve, reject) => {
    const child = NodeChildProcess.spawn(
      "python",
      ["-u", "-m", "pip", "install", "--upgrade", "platformio"],
      {
        windowsHide: true,
      },
    );

    let currentProgress = 10;

    const handleOutput = (data: Buffer) => {
      const text = data.toString();
      const lower = text.toLowerCase();

      if (lower.includes("requirement already satisfied")) {
        currentProgress = Math.max(currentProgress, 90);
      } else if (lower.includes("collecting")) {
        currentProgress = Math.max(currentProgress, 25);
      } else if (lower.includes("downloading") || lower.includes("using cached")) {
        currentProgress = Math.max(currentProgress, 50);
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
          `Failed to launch Python: ${err.message}. Please ensure Python 3 is installed and on your PATH.`,
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
        reject(new Error(`pip install exited with error code ${code}`));
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
