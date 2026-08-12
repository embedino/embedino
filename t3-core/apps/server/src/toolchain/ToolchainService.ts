// @effect-diagnostics nodeBuiltinImport:off globalTimersInEffect:off
import { ToolchainInstallProgressEvent, ToolchainInstallError, ToolchainStatus } from "@t3tools/contracts";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Queue from "effect/Queue";
import * as NodeChildProcess from "node:child_process";
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";

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
    NodePath.join(localAppData, "Arduino15", "arduino-cli.exe"),
    NodePath.join(userProfile, "bin", "arduino-cli.exe"),
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
// Install toolchain — streams real progress events from pip / powershell
// ---------------------------------------------------------------------------

const installToolchainInternal = (
  toolchain: "platformio" | "arduino"
): Stream.Stream<ToolchainInstallProgressEvent, ToolchainInstallError> => {
  return Stream.callback<ToolchainInstallProgressEvent, ToolchainInstallError>((queue) => {
    let command: string;
    let args: string[];

    if (toolchain === "platformio") {
      command = "python";
      args = ["-u", "-m", "pip", "install", "platformio"];
    } else if (toolchain === "arduino") {
      command = "powershell";
      args = [
        "-NoProfile", "-NonInteractive", "-Command",
        "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $url = 'https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip'; $out = Join-Path $env:TEMP 'arduino-cli.zip'; $dest = Join-Path $env:USERPROFILE 'bin'; Write-Host 'Downloading Arduino CLI...'; New-Item -ItemType Directory -Force -Path $dest | Out-Null; Invoke-WebRequest -Uri $url -OutFile $out; Write-Host 'Extracting Arduino CLI...'; Expand-Archive -Path $out -DestinationPath $dest -Force; Write-Host 'Installation completed successfully.'"
      ];
    } else {
      return Queue.fail(queue, new ToolchainInstallError({ message: "Unknown toolchain type" })).pipe(Effect.asVoid);
    }

    const parseProgress = (text: string, current: number): number => {
      const lower = text.toLowerCase();
      if (toolchain === "platformio") {
        if (lower.includes("requirement already satisfied")) return Math.max(current, 90);
        if (lower.includes("collecting")) return Math.max(current, 15);
        if (lower.includes("downloading") || lower.includes("using cached")) return Math.max(current, 40);
        if (lower.includes("installing collected") || lower.includes("uninstalling")) return Math.max(current, 70);
        if (lower.includes("successfully installed")) return 95;
      } else {
        if (lower.includes("downloading")) return Math.max(current, 25);
        if (lower.includes("unpacking") || lower.includes("extracting")) return Math.max(current, 60);
        if (lower.includes("installing") || lower.includes("copying")) return Math.max(current, 85);
      }
      return current;
    };

    return Effect.callback<void, ToolchainInstallError>((resume) => {
      let currentProgress = 0;

      try {
        const child = NodeChildProcess.spawn(command, args, { shell: true, windowsHide: true });

        Effect.runFork(
          Queue.offer(queue, { type: "progress" as const, progress: 0, stdout: `Starting ${toolchain} installation...\n` })
        );

        // Smooth progress ticker
        const ticker = setInterval(() => {
          if (currentProgress < 95) {
            currentProgress += 1;
            Effect.runFork(
              Queue.offer(queue, { type: "progress" as const, progress: currentProgress })
            );
          }
        }, 300);

        child.stdout?.on("data", (data: Buffer) => {
          const text = data.toString();
          currentProgress = parseProgress(text, currentProgress);
          Effect.runFork(
            Queue.offer(queue, { type: "progress" as const, progress: currentProgress, stdout: text })
          );
        });

        child.stderr?.on("data", (data: Buffer) => {
          const text = data.toString();
          currentProgress = parseProgress(text, currentProgress);
          Effect.runFork(
            Queue.offer(queue, { type: "progress" as const, progress: currentProgress, stdout: text })
          );
        });

        child.on("error", (error) => {
          clearInterval(ticker);
          resume(Effect.fail(new ToolchainInstallError({ message: `Process error: ${error.message}` })));
        });

        child.on("close", (code) => {
          clearInterval(ticker);
          if (code === 0) {
            Effect.runFork(
              Queue.offer(queue, { type: "progress" as const, progress: 100, stdout: "Installation completed successfully." }).pipe(
                Effect.andThen(Queue.end(queue))
              )
            );
            resume(Effect.void);
          } else {
            resume(Effect.fail(new ToolchainInstallError({ message: `Process exited with code ${code}` })));
          }
        });
      } catch (e: any) {
        resume(Effect.fail(new ToolchainInstallError({ message: `Spawn failed: ${e.message}` })));
      }
    }).pipe(Effect.forkScoped, Effect.asVoid);
  });
};

export const installToolchainPlatformio = () => installToolchainInternal("platformio");
export const installToolchainArduino = () => installToolchainInternal("arduino");
