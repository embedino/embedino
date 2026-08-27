// @effect-diagnostics nodeBuiltinImport:off
import { sha256 } from "@noble/hashes/sha2";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { describe, expect, it } from "@effect/vitest";
import * as NodePath from "node:path";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Encoding from "effect/Encoding";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import { HttpClient, HttpClientResponse } from "effect/unstable/http";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";
import { HostProcessArchitecture, HostProcessPlatform } from "./hostProcess.ts";

import {
  RelayClientInstallError,
  CLOUDFLARED_VERSION,
  makeCloudflaredRelayClient,
} from "./relayClient.ts";

// The manager talks to the real host filesystem (NodeServices.layer), so the
// tests must run against the host's own platform and path conventions:
// overriding the platform reference to a POSIX value on Windows breaks the
// exec-bit check (chmod cannot set mode bits on NTFS) and forward-slash path
// expectations. Expected names/paths are derived from the same host-process
// references the implementation reads.
const hostExecutableFileName = Effect.gen(function* () {
  const platform = yield* HostProcessPlatform;
  return platform === "win32" ? "cloudflared.exe" : "cloudflared";
});

const hostRuntimeLayer = (env: Record<string, string> = {}) =>
  Layer.mergeAll(ConfigProvider.layer(ConfigProvider.fromEnv({ env })));

function makeHandle(exitCode = 0) {
  return ChildProcessSpawner.makeHandle({
    pid: ChildProcessSpawner.ProcessId(100),
    exitCode: Effect.succeed(ChildProcessSpawner.ExitCode(exitCode)),
    isRunning: Effect.succeed(false),
    kill: () => Effect.void,
    unref: Effect.succeed(Effect.void),
    stdin: Sink.drain,
    stdout: Stream.empty,
    stderr: Stream.empty,
    all: Stream.empty,
    getInputFd: () => Sink.drain,
    getOutputFd: () => Stream.empty,
  });
}

const makeHttpClientLayer = (bytes: Uint8Array) =>
  Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request) =>
      Effect.succeed(
        HttpClientResponse.fromWeb(request, new Response(bytes.buffer as ArrayBuffer)),
      ),
    ),
  );

const makeSpawnerLayer = (commands: Array<string>) =>
  Layer.succeed(
    ChildProcessSpawner.ChildProcessSpawner,
    ChildProcessSpawner.make((command) =>
      Effect.sync(() => {
        commands.push(ChildProcess.isStandardCommand(command) ? command.command : "piped-command");
        return makeHandle();
      }),
    ),
  );

describe("RelayClient", () => {
  it.effect("resolves explicit overrides before managed and PATH executables", () =>
    Effect.gen(function* () {
      const fileSystem = yield* FileSystem.FileSystem;
      const baseDir = yield* fileSystem.makeTempDirectoryScoped({
        prefix: "embedino-cloudflared-test-",
      });
      const overridePath = NodePath.join(baseDir, "override-cloudflared");
      yield* fileSystem.writeFileString(overridePath, "override");
      yield* fileSystem.chmod(overridePath, 0o755);
      const manager = yield* makeCloudflaredRelayClient({
        baseDir,
      });

      expect(
        yield* manager.resolve.pipe(
          Effect.provideService(
            ConfigProvider.ConfigProvider,
            ConfigProvider.fromEnv({
              env: { PATH: "", EMBEDINO_CLOUDFLARED_PATH: overridePath },
            }),
          ),
        ),
      ).toEqual({
        status: "available",
        executablePath: overridePath,
        source: "override",
        version: CLOUDFLARED_VERSION,
      });
    }).pipe(
      Effect.scoped,
      Effect.provide(
        Layer.mergeAll(
          NodeServices.layer,
          makeHttpClientLayer(new Uint8Array()),
          makeSpawnerLayer([]),
          hostRuntimeLayer(),
        ),
      ),
    ),
  );

  it.effect("downloads, verifies, validates, and atomically installs the managed executable", () =>
    Effect.gen(function* () {
      const fileSystem = yield* FileSystem.FileSystem;
      const baseDir = yield* fileSystem.makeTempDirectoryScoped({
        prefix: "embedino-cloudflared-test-",
      });
      const bytes = new TextEncoder().encode("test-cloudflared-binary");
      const manager = yield* makeCloudflaredRelayClient({
        baseDir,
        releaseAsset: {
          url: "https://example.test/cloudflared",
          sha256: Encoding.encodeHex(sha256(bytes)),
          archive: "binary",
        },
      });

      const progress: Array<string> = [];
      const installed = yield* manager.installWithProgress((event) =>
        Effect.sync(() => {
          if (event.type === "progress") {
            progress.push(event.stage);
          }
        }),
      );
      const hostPlatform = yield* HostProcessPlatform;
      const hostArch = yield* HostProcessArchitecture;
      const managedPath = NodePath.join(
        baseDir,
        "tools",
        "cloudflared",
        CLOUDFLARED_VERSION,
        `${hostPlatform}-${hostArch}`,
        yield* hostExecutableFileName,
      );
      expect(installed).toEqual({
        status: "available",
        executablePath: managedPath,
        source: "managed",
        version: CLOUDFLARED_VERSION,
      });
      expect(new TextDecoder().decode(yield* fileSystem.readFile(managedPath))).toBe(
        "test-cloudflared-binary",
      );
      expect(progress).toEqual([
        "checking",
        "waiting_for_lock",
        "downloading",
        "verifying",
        "installing",
        "validating",
        "activating",
      ]);
      expect(yield* manager.resolve).toEqual(installed);
    }).pipe(
      Effect.scoped,
      Effect.provide(
        Layer.mergeAll(
          NodeServices.layer,
          makeHttpClientLayer(new TextEncoder().encode("test-cloudflared-binary")),
          makeSpawnerLayer([]),
          hostRuntimeLayer(),
        ),
      ),
    ),
  );

  it.effect("rejects downloads whose checksum does not match the pinned manifest", () =>
    Effect.gen(function* () {
      const fileSystem = yield* FileSystem.FileSystem;
      const baseDir = yield* fileSystem.makeTempDirectoryScoped({
        prefix: "embedino-cloudflared-test-",
      });
      const manager = yield* makeCloudflaredRelayClient({
        baseDir,
        releaseAsset: {
          url: "https://example.test/cloudflared",
          sha256: Encoding.encodeHex(sha256(new TextEncoder().encode("expected"))),
          archive: "binary",
        },
      });

      const error = yield* manager.install.pipe(Effect.flip);
      expect(error).toBeInstanceOf(RelayClientInstallError);
      expect(error.reason).toBe("invalid_checksum");
    }).pipe(
      Effect.scoped,
      Effect.provide(
        Layer.mergeAll(
          NodeServices.layer,
          makeHttpClientLayer(new TextEncoder().encode("tampered")),
          makeSpawnerLayer([]),
          hostRuntimeLayer(),
        ),
      ),
    ),
  );

  it.effect("serializes concurrent installs within one runtime", () => {
    const commands: Array<string> = [];
    const bytes = new TextEncoder().encode("test-cloudflared-binary");
    return Effect.gen(function* () {
      const fileSystem = yield* FileSystem.FileSystem;
      const baseDir = yield* fileSystem.makeTempDirectoryScoped({
        prefix: "embedino-cloudflared-test-",
      });
      const manager = yield* makeCloudflaredRelayClient({
        baseDir,
        releaseAsset: {
          url: "https://example.test/cloudflared",
          sha256: Encoding.encodeHex(sha256(bytes)),
          archive: "binary",
        },
      });

      const [first, second] = yield* Effect.all([manager.install, manager.install], {
        concurrency: "unbounded",
      });
      expect(second).toEqual(first);
      expect(commands).toHaveLength(1);
    }).pipe(
      Effect.scoped,
      Effect.provide(
        Layer.mergeAll(
          NodeServices.layer,
          makeHttpClientLayer(bytes),
          makeSpawnerLayer(commands),
          hostRuntimeLayer(),
        ),
      ),
    );
  });

  it.effect("observes PATH changes after the manager has been constructed", () => {
    const env = { PATH: "" };
    return Effect.gen(function* () {
      const fileSystem = yield* FileSystem.FileSystem;
      const baseDir = yield* fileSystem.makeTempDirectoryScoped({
        prefix: "embedino-cloudflared-test-",
      });
      const binDir = NodePath.join(baseDir, "bin");
      const executablePath = NodePath.join(binDir, yield* hostExecutableFileName);
      const manager = yield* makeCloudflaredRelayClient({
        baseDir,
      });

      expect(yield* manager.resolve).toEqual({
        status: "missing",
        version: CLOUDFLARED_VERSION,
      });

      yield* fileSystem.makeDirectory(binDir);
      yield* fileSystem.writeFileString(executablePath, "cloudflared");
      yield* fileSystem.chmod(executablePath, 0o755);
      env.PATH = binDir;

      expect(yield* manager.resolve).toEqual({
        status: "available",
        executablePath,
        source: "path",
        version: CLOUDFLARED_VERSION,
      });
    }).pipe(
      Effect.scoped,
      Effect.provide(
        Layer.mergeAll(
          NodeServices.layer,
          makeHttpClientLayer(new Uint8Array()),
          makeSpawnerLayer([]),
          hostRuntimeLayer(env),
        ),
      ),
    );
  });
});
