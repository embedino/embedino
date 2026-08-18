import { EnvironmentId, WS_METHODS } from "@t3tools/contracts";
import { EnvironmentRegistry } from "@t3tools/client-runtime/connection";
import { request, runStream } from "@t3tools/client-runtime/rpc";
import { createRuntimeCommand } from "@t3tools/client-runtime/state/runtime";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Schema from "effect/Schema";
import { Atom } from "effect/unstable/reactivity";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { appAtomRegistry } from "~/rpc/atomRegistry";
import { connectionAtomRuntime } from "../connection/runtime";

// ---------------------------------------------------------------------------
// Toolchain State Atom & Registry Management
// ---------------------------------------------------------------------------

export interface ToolchainState {
  readonly installing: "platformio" | "arduino" | null;
  readonly progress: number;
  readonly error: string | null;
  readonly platformioInstalled: boolean;
  readonly platformioVersion: string | null;
  readonly platformioPath: string | null;
  readonly arduinoInstalled: boolean;
  readonly arduinoVersion: string | null;
  readonly arduinoCliPath: string | null;
  readonly statusLoaded: boolean;
}

export const initialToolchainState: ToolchainState = {
  installing: null,
  progress: 0,
  error: null,
  platformioInstalled: false,
  platformioVersion: null,
  platformioPath: null,
  arduinoInstalled: false,
  arduinoVersion: null,
  arduinoCliPath: null,
  statusLoaded: false,
};

export const toolchainStateAtom = Atom.make<ToolchainState>(initialToolchainState).pipe(
  Atom.keepAlive,
  Atom.withLabel("web-toolchain-state"),
);

export function updateToolchainState(patch: Partial<ToolchainState>): void {
  appAtomRegistry.update(toolchainStateAtom, (current) => ({
    ...current,
    ...patch,
  }));
}

// ---------------------------------------------------------------------------
// Toolchain Schemas & Types
// ---------------------------------------------------------------------------

import { ToolchainTypeSchema, type ToolchainType } from "@t3tools/contracts";

export const ActiveToolchainSchema = Schema.NullOr(ToolchainTypeSchema);
export type ActiveToolchain = Schema.Schema.Type<typeof ActiveToolchainSchema>;

// ---------------------------------------------------------------------------
// toolchainGetStatus — unary RPC via createRuntimeCommand
// Pattern: exactly matches linkEnvironmentAtoms.ts + linkEnvironment.ts
// ---------------------------------------------------------------------------

function getToolchainStatusEffect(environmentId: EnvironmentId) {
  return Effect.gen(function* () {
    const registry = yield* EnvironmentRegistry;
    return yield* registry.run(environmentId, request(WS_METHODS.toolchainGetStatus, {}));
  });
}

export const toolchainGetStatusCommand = createRuntimeCommand(connectionAtomRuntime, {
  label: "toolchain-get-status",
  execute: (input: { readonly environmentId: EnvironmentId }) =>
    getToolchainStatusEffect(input.environmentId),
});

// ---------------------------------------------------------------------------
// toolchainInstall — streaming RPC via createRuntimeCommand
// Pattern: exactly matches cloudInstallRelayClient in linkEnvironment.ts
// ---------------------------------------------------------------------------

function installToolchainEffect(
  environmentId: EnvironmentId,
  type: ToolchainType,
  onProgress: (progress: number, stdout?: string) => void,
) {
  return Effect.gen(function* () {
    const registry = yield* EnvironmentRegistry;
    const method =
      type === "platformio"
        ? WS_METHODS.toolchainInstallPlatformio
        : WS_METHODS.toolchainInstallArduino;
    yield* registry
      .runStream(
        environmentId,
        runStream(method, {}).pipe(
          Stream.tap((event) =>
            Effect.sync(() => {
              const e = event as { progress?: number; stdout?: string };
              onProgress(e.progress ?? 0, e.stdout);
            }),
          ),
        ),
      )
      .pipe(Stream.runDrain);
  });
}

export const toolchainInstallCommand = createRuntimeCommand(connectionAtomRuntime, {
  label: "toolchain-install",
  execute: (input: {
    readonly environmentId: EnvironmentId;
    readonly type: ToolchainType;
    readonly onProgress: (progress: number, stdout?: string) => void;
  }) => installToolchainEffect(input.environmentId, input.type, input.onProgress),
});

// ---------------------------------------------------------------------------
// LocalStorage hook for active toolchain preference
// ---------------------------------------------------------------------------

export function useActiveToolchain(): [
  ActiveToolchain,
  (value: ActiveToolchain | ((val: ActiveToolchain) => ActiveToolchain)) => void,
] {
  return useLocalStorage("embedino-active-toolchain", null, ActiveToolchainSchema);
}
