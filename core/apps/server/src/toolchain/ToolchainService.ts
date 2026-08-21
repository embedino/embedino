// @effect-diagnostics nodeBuiltinImport:off globalTimersInEffect:off globalDate:off globalFetch:off
import {
  ToolchainInstallProgressEvent,
  ToolchainInstallError,
  ToolchainStatus,
} from "@embedino/contracts";
import { HostProcessPlatform, HostProcessArchitecture } from "@embedino/shared/hostProcess";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Queue from "effect/Queue";
import * as NodeChildProcess from "node:child_process";
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";
import * as NodeOS from "node:os";

// ---------------------------------------------------------------------------
// Cross-Platform Host Environment Helpers
// ---------------------------------------------------------------------------

function getUserHome(): string {
  return process.env.USERPROFILE || process.env.HOME || NodeOS.homedir() || "";
}

function getExecutableExtension(platform: NodeJS.Platform): string {
  return platform === "win32" ? ".exe" : "";
}

function getArduinoCliDestDir(platform: NodeJS.Platform): string {
  const home = getUserHome();
  if (platform === "win32") {
    return NodePath.join(home, "bin");
  }
  return NodePath.join(home, ".local", "bin");
}

function getPlatformioPenvDir(): string {
  return NodePath.join(getUserHome(), ".platformio", "penv");
}

function getPenvBinDir(platform: NodeJS.Platform): string {
  const penv = getPlatformioPenvDir();
  return platform === "win32" ? NodePath.join(penv, "Scripts") : NodePath.join(penv, "bin");
}

// ---------------------------------------------------------------------------
// Cross-Platform Arduino CLI Release Assets
// ---------------------------------------------------------------------------

interface ArduinoReleaseAsset {
  readonly url: string;
  readonly archiveFormat: "zip" | "tar.gz";
}

const ARDUINO_CLI_RELEASE_ASSETS: Readonly<
  Partial<Record<`${NodeJS.Platform}-${string}`, ArduinoReleaseAsset>>
> = {
  "win32-x64": {
    url: "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip",
    archiveFormat: "zip",
  },
  "win32-arm64": {
    url: "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_ARM64.zip",
    archiveFormat: "zip",
  },
  "darwin-arm64": {
    url: "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_macOS_ARM64.tar.gz",
    archiveFormat: "tar.gz",
  },
  "darwin-x64": {
    url: "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_macOS_64bit.tar.gz",
    archiveFormat: "tar.gz",
  },
  "linux-x64": {
    url: "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_64bit.tar.gz",
    archiveFormat: "tar.gz",
  },
  "linux-arm64": {
    url: "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_ARM64.tar.gz",
    archiveFormat: "tar.gz",
  },
};

function resolveArduinoReleaseAsset(platform: NodeJS.Platform, arch: string): ArduinoReleaseAsset {
  const key = `${platform}-${arch}` as const;
  const asset = ARDUINO_CLI_RELEASE_ASSETS[key];
  if (asset) return asset;

  if (platform === "win32") {
    return {
      url: "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip",
      archiveFormat: "zip",
    };
  }
  if (platform === "darwin") {
    return {
      url: "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_macOS_64bit.tar.gz",
      archiveFormat: "tar.gz",
    };
  }
  return {
    url: "https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_64bit.tar.gz",
    archiveFormat: "tar.gz",
  };
}

// ---------------------------------------------------------------------------
// Dynamic Discovery & Introspection (PlatformIO & Arduino CLI)
// ---------------------------------------------------------------------------

function resolvePythonCommand(platform: NodeJS.Platform): string {
  const localAppData = process.env.LOCALAPPDATA || "";
  const home = getUserHome();

  const candidates = [
    "python3",
    "python",
    "py",
    "/usr/bin/python3",
    "/usr/local/bin/python3",
    "/opt/homebrew/bin/python3",
    NodePath.join(home, ".pyenv", "shims", "python3"),
  ];

  if (platform === "win32") {
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
  }

  for (const c of candidates) {
    if (c.includes(NodePath.sep)) {
      try {
        if (NodeFS.existsSync(c)) return c;
      } catch {}
    }
  }

  return platform === "win32" ? "python" : "python3";
}

function findPio(platform: NodeJS.Platform): {
  installed: boolean;
  version: string | null;
  path: string | null;
} {
  const home = getUserHome();
  const ext = getExecutableExtension(platform);
  const candidates: string[] = [];

  // 1. Check PlatformIO virtualenv first (highest priority, isolated)
  const penvPio = NodePath.join(getPenvBinDir(platform), `pio${ext}`);
  candidates.push(penvPio);

  // 2. Check system PATH
  const pathDirs = (process.env.PATH || "").split(NodePath.delimiter);
  for (const dir of pathDirs) {
    if (dir.trim()) {
      candidates.push(NodePath.join(dir.trim(), `pio${ext}`));
      if (ext) candidates.push(NodePath.join(dir.trim(), "pio"));
    }
  }

  // 3. Check standard platform locations
  if (platform === "win32") {
    const appData = process.env.APPDATA || "";
    const localAppData = process.env.LOCALAPPDATA || "";

    try {
      const pyDir = NodePath.join(appData, "Python");
      if (NodeFS.existsSync(pyDir)) {
        for (const entry of NodeFS.readdirSync(pyDir)) {
          candidates.push(NodePath.join(pyDir, entry, "Scripts", "pio.exe"));
        }
      }
    } catch {}

    try {
      const pyProgDir = NodePath.join(localAppData, "Programs", "Python");
      if (NodeFS.existsSync(pyProgDir)) {
        for (const entry of NodeFS.readdirSync(pyProgDir)) {
          candidates.push(NodePath.join(pyProgDir, entry, "Scripts", "pio.exe"));
        }
      }
    } catch {}

    try {
      const rootEntries = NodeFS.readdirSync("C:\\");
      for (const entry of rootEntries) {
        if (entry.toLowerCase().startsWith("python")) {
          candidates.push(NodePath.join("C:\\", entry, "Scripts", "pio.exe"));
        }
      }
    } catch {}
  } else {
    candidates.push(NodePath.join(home, ".local", "bin", "pio"));
    candidates.push(NodePath.join(home, "bin", "pio"));
    candidates.push("/usr/local/bin/pio");
    candidates.push("/opt/homebrew/bin/pio");
  }

  for (const candidate of candidates) {
    try {
      if (NodeFS.existsSync(candidate)) {
        const ver = extractPioVersion(candidate);
        return { installed: true, version: ver ?? "PlatformIO Core", path: candidate };
      }
    } catch {}
  }

  return { installed: false, version: null, path: null };
}

function extractPioVersion(binaryPath: string): string | null {
  try {
    const res = NodeChildProcess.spawnSync(binaryPath, ["--version"], {
      encoding: "utf8",
      timeout: 3000,
      windowsHide: true,
    });
    if (res.status === 0 && res.stdout) {
      const match = res.stdout.match(/PlatformIO Core, version ([0-9a-zA-Z.-]+)/i);
      if (match?.[1]) return `PlatformIO v${match[1]}`;
    }
  } catch {}
  return "PlatformIO Core";
}

function findArduinoCli(platform: NodeJS.Platform): {
  installed: boolean;
  version: string | null;
  path: string | null;
} {
  const home = getUserHome();
  const ext = getExecutableExtension(platform);
  const candidates: string[] = [];

  // 1. Managed user binary directory
  candidates.push(NodePath.join(getArduinoCliDestDir(platform), `arduino-cli${ext}`));
  candidates.push(NodePath.join(home, "bin", `arduino-cli${ext}`));
  candidates.push(NodePath.join(home, ".arduino", `arduino-cli${ext}`));

  // 2. System PATH
  const pathDirs = (process.env.PATH || "").split(NodePath.delimiter);
  for (const dir of pathDirs) {
    if (dir.trim()) {
      candidates.push(NodePath.join(dir.trim(), `arduino-cli${ext}`));
      if (ext) candidates.push(NodePath.join(dir.trim(), "arduino-cli"));
    }
  }

  // 3. Standard platform directories
  if (platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA || "";
    const programFiles = process.env.ProgramFiles || "C:\\Program Files";
    candidates.push(NodePath.join(localAppData, "Arduino15", "arduino-cli.exe"));
    candidates.push(NodePath.join(programFiles, "Arduino CLI", "arduino-cli.exe"));
  } else {
    candidates.push("/usr/local/bin/arduino-cli");
    candidates.push("/opt/homebrew/bin/arduino-cli");
    candidates.push(NodePath.join(home, ".arduino15", "arduino-cli"));
  }

  for (const candidate of candidates) {
    try {
      if (NodeFS.existsSync(candidate)) {
        const ver = extractArduinoCliVersion(candidate);
        return { installed: true, version: ver ?? "Arduino CLI", path: candidate };
      }
    } catch {}
  }

  return { installed: false, version: null, path: null };
}

function extractArduinoCliVersion(binaryPath: string): string | null {
  try {
    const res = NodeChildProcess.spawnSync(binaryPath, ["version", "--format", "json"], {
      encoding: "utf8",
      timeout: 3000,
      windowsHide: true,
    });
    if (res.status === 0 && res.stdout) {
      const parsed = JSON.parse(res.stdout) as { VersionString?: string; version_string?: string };
      const v = parsed.VersionString || parsed.version_string;
      if (v) return `Arduino CLI v${v}`;
    }
  } catch {}
  return "Arduino CLI";
}

export const getToolchainStatus = () =>
  Effect.gen(function* () {
    const platform = yield* HostProcessPlatform;
    const pio = findPio(platform);
    const arduino = findArduinoCli(platform);

    return {
      platformioInstalled: pio.installed,
      platformioVersion: pio.version,
      platformioPath: pio.path,
      arduinoInstalled: arduino.installed,
      arduinoVersion: arduino.version,
      arduinoCliPath: arduino.path,
    } satisfies ToolchainStatus;
  });

/**
 * Returns the resolved absolute filesystem paths for installed toolchain
 * binaries. Used by HardwareAgentPrompt to inject full paths into agent
 * instructions so the agent never relies on the system PATH.
 */
export const getToolchainBinaryPaths = () =>
  Effect.gen(function* () {
    const platform = yield* HostProcessPlatform;
    const ext = getExecutableExtension(platform);

    // Resolve Arduino CLI binary path
    let arduinoCliPath: string | null = null;
    const arduinoCandidates = [
      NodePath.join(getArduinoCliDestDir(platform), `arduino-cli${ext}`),
      NodePath.join(getUserHome(), "bin", `arduino-cli${ext}`),
      NodePath.join(getUserHome(), ".arduino", `arduino-cli${ext}`),
    ];
    if (platform === "win32") {
      const localAppData = process.env.LOCALAPPDATA || "";
      const programFiles = process.env.ProgramFiles || "C:\\Program Files";
      arduinoCandidates.push(NodePath.join(localAppData, "Arduino15", "arduino-cli.exe"));
      arduinoCandidates.push(NodePath.join(programFiles, "Arduino CLI", "arduino-cli.exe"));
    }
    for (const candidate of arduinoCandidates) {
      try {
        if (NodeFS.existsSync(candidate)) {
          arduinoCliPath = candidate;
          break;
        }
      } catch {}
    }

    // Resolve PlatformIO binary path
    let platformioPath: string | null = null;
    const pioCandidates = [NodePath.join(getPenvBinDir(platform), `pio${ext}`)];
    if (platform === "win32") {
      const appData = process.env.APPDATA || "";
      try {
        const pyDir = NodePath.join(appData, "Python");
        if (NodeFS.existsSync(pyDir)) {
          for (const entry of NodeFS.readdirSync(pyDir)) {
            pioCandidates.push(NodePath.join(pyDir, entry, "Scripts", "pio.exe"));
          }
        }
      } catch {}
      const localAppData = process.env.LOCALAPPDATA || "";
      try {
        const pyDir = NodePath.join(localAppData, "Programs", "Python");
        if (NodeFS.existsSync(pyDir)) {
          for (const entry of NodeFS.readdirSync(pyDir)) {
            pioCandidates.push(NodePath.join(pyDir, entry, "Scripts", "pio.exe"));
          }
        }
      } catch {}
    }
    for (const candidate of pioCandidates) {
      try {
        if (NodeFS.existsSync(candidate)) {
          platformioPath = candidate;
          break;
        }
      } catch {}
    }

    return { arduinoCliPath, platformioPath };
  });

// ---------------------------------------------------------------------------
// Cross-Platform Installation Pipelines
// ---------------------------------------------------------------------------

async function installArduinoCliAsync(
  platform: NodeJS.Platform,
  arch: string,
  emit: (event: ToolchainInstallProgressEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const asset = resolveArduinoReleaseAsset(platform, arch);
  const destDir = getArduinoCliDestDir(platform);
  const ext = getExecutableExtension(platform);
  const binaryPath = NodePath.join(destDir, `arduino-cli${ext}`);

  emit({
    type: "progress",
    progress: 5,
    stdout: `Target host platform: ${platform} (${arch})\n`,
  });

  if (!NodeFS.existsSync(destDir)) {
    NodeFS.mkdirSync(destDir, { recursive: true });
  }

  emit({
    type: "progress",
    progress: 10,
    stdout: `Downloading Arduino CLI package from ${asset.url}...\n`,
  });

  const response = await fetch(asset.url, { signal });
  if (!response.ok || !response.body) {
    throw new Error(`Download failed: HTTP ${response.status} ${response.statusText}`);
  }

  const contentLength = Number(response.headers.get("content-length")) || 18000000;
  const tempArchive = NodePath.join(
    NodeOS.tmpdir(),
    `arduino-cli-${Date.now()}.${asset.archiveFormat === "zip" ? "zip" : "tar.gz"}`,
  );

  let receivedBytes = 0;
  let lastProgress = 10;

  const fileStream = NodeFS.createWriteStream(tempArchive);
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
    stdout: `Extracting Arduino CLI package to ${destDir}...\n`,
  });

  await new Promise<void>((resolve, reject) => {
    const tarArgs =
      asset.archiveFormat === "zip"
        ? ["-xf", tempArchive, "-C", destDir]
        : ["-xzf", tempArchive, "-C", destDir];
    const child = NodeChildProcess.spawn("tar", tarArgs, {
      windowsHide: true,
      signal,
    });
    child.on("error", (err) => {
      if (err.name === "AbortError") reject(new Error("Installation cancelled."));
      else reject(new Error(`Failed to extract archive: ${err.message}`));
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Extraction failed with exit code ${code}`));
    });
  });

  try {
    if (NodeFS.existsSync(tempArchive)) NodeFS.unlinkSync(tempArchive);
  } catch {}

  if (platform !== "win32") {
    try {
      if (NodeFS.existsSync(binaryPath)) {
        NodeFS.chmodSync(binaryPath, 0o755);
      }
    } catch {}
  }

  emit({
    type: "progress",
    progress: 90,
    stdout: "Verifying Arduino CLI installation...\n",
  });

  const verified = findArduinoCli(platform);
  if (!verified.installed && !NodeFS.existsSync(binaryPath)) {
    throw new Error(
      `Installation completed, but arduino-cli binary was not found at ${binaryPath}`,
    );
  }

  emit({
    type: "progress",
    progress: 100,
    stdout: `Arduino CLI installed and verified successfully (${verified.version ?? "ready"})!\n`,
  });
}

async function installPlatformioAsync(
  platform: NodeJS.Platform,
  _arch: string,
  emit: (event: ToolchainInstallProgressEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const pythonCmd = resolvePythonCommand(platform);
  const penvDir = getPlatformioPenvDir();
  const penvBin = getPenvBinDir(platform);
  const ext = getExecutableExtension(platform);
  const penvPip = NodePath.join(penvBin, `pip${ext}`);
  const penvPio = NodePath.join(penvBin, `pio${ext}`);

  emit({
    type: "progress",
    progress: 5,
    stdout: `Found Python runtime: ${pythonCmd}\nSetting up isolated virtual environment at ${penvDir}...\n`,
  });

  if (!NodeFS.existsSync(penvPip)) {
    await new Promise<void>((resolve, reject) => {
      const venvProcess = NodeChildProcess.spawn(pythonCmd, ["-m", "venv", penvDir], {
        windowsHide: true,
        signal,
      });
      venvProcess.on("error", (err) => {
        if (err.name === "AbortError") reject(new Error("Installation cancelled."));
        else
          reject(
            new Error(
              `Failed to create virtual environment with ${pythonCmd}: ${err.message}. Please ensure Python 3 venv module is installed.`,
            ),
          );
      });
      venvProcess.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Python venv creation failed with exit code ${code}`));
      });
    });
  }

  emit({
    type: "progress",
    progress: 30,
    stdout: "Virtual environment initialized. Installing PlatformIO Core via pip...\n",
  });

  const pipExecutable = NodeFS.existsSync(penvPip) ? penvPip : pythonCmd;
  const pipArgs = NodeFS.existsSync(penvPip)
    ? ["-u", "install", "--upgrade", "platformio"]
    : ["-u", "-m", "pip", "install", "--upgrade", "platformio"];

  await new Promise<void>((resolve, reject) => {
    const child = NodeChildProcess.spawn(pipExecutable, pipArgs, {
      windowsHide: true,
      signal,
    });

    let currentProgress = 35;

    const handleOutput = (data: Buffer) => {
      const text = data.toString();
      const lower = text.toLowerCase();

      if (lower.includes("requirement already satisfied")) {
        currentProgress = Math.max(currentProgress, 90);
      } else if (lower.includes("collecting")) {
        currentProgress = Math.max(currentProgress, 45);
      } else if (lower.includes("downloading") || lower.includes("using cached")) {
        currentProgress = Math.max(currentProgress, 60);
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
      if (err.name === "AbortError") reject(new Error("Installation cancelled."));
      else reject(new Error(`Failed to execute pip (${pipExecutable}): ${err.message}`));
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`PlatformIO pip installation failed with exit code ${code}`));
      }
    });
  });

  if (platform !== "win32" && NodeFS.existsSync(penvPio)) {
    try {
      NodeFS.chmodSync(penvPio, 0o755);
    } catch {}
  }

  emit({
    type: "progress",
    progress: 95,
    stdout: "Verifying PlatformIO Core installation...\n",
  });

  const verified = findPio(platform);
  emit({
    type: "progress",
    progress: 100,
    stdout: `PlatformIO Core installed and verified successfully (${verified.version ?? "ready"})!\n`,
  });
}

// ---------------------------------------------------------------------------
// Stream Construction with Abort Lifecycle
// ---------------------------------------------------------------------------

const installToolchainInternal = (toolchain: "platformio" | "arduino") =>
  Stream.fromEffect(
    Effect.gen(function* () {
      const platform = yield* HostProcessPlatform;
      const arch = yield* HostProcessArchitecture;
      return { platform, arch };
    }),
  ).pipe(
    Stream.flatMap(({ platform, arch }) =>
      Stream.callback<ToolchainInstallProgressEvent, ToolchainInstallError>((queue) => {
        let cancelled = false;
        const abortController = new AbortController();

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
              await installArduinoCliAsync(platform, arch, emit, abortController.signal);
            } else {
              await installPlatformioAsync(platform, arch, emit, abortController.signal);
            }
            done();
          } catch (err: any) {
            fail(new ToolchainInstallError({ message: err?.message ?? String(err) }));
          }
        })();

        return Effect.acquireRelease(Effect.void, () =>
          Effect.sync(() => {
            cancelled = true;
            abortController.abort();
          }),
        );
      }),
    ),
  );

export const installToolchainPlatformio = () => installToolchainInternal("platformio");
export const installToolchainArduino = () => installToolchainInternal("arduino");
