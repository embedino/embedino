# Toolchain State Specification & Effect Schema Mining Report (Spec Miner M1-3)

**Target Module**: `apps/web/src/state/toolchain.ts`  
**Working Directory**: `c:\Users\rapid\Desktop\embedino workspace\t3-core\.agents\spec_miner_m1_3`  
**Date**: 2026-08-12

---

## Features Discovered

| #   | Category                    | Feature                                     | Description                                                                                            | Inputs                                                                                                                                                  | Outputs                                                                                                                                              | Error Behavior                                                                               | Discovered Via                                                                                                                                |
| --- | --------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Type & Schema Specification | `ToolchainTypeSchema` & `ToolchainType`     | Effect Schema literal for valid toolchain names (`"platformio"` or `"arduino"`).                       | N/A                                                                                                                                                     | `Schema.Schema<"platformio" \| "arduino", "platformio" \| "arduino">`                                                                                | Fails decode with `ParseError` if string is not `"platformio"` or `"arduino"`.               | `packages/contracts/src/toolchain.ts`, `apps/server/src/toolchain/ToolchainService.ts`, `apps/web/src/state/toolchain.ts`                     |
| 2   | Type & Schema Specification | `ActiveToolchainSchema` & `ActiveToolchain` | Effect Schema for nullable toolchain preference state (`Schema.NullOr(ToolchainTypeSchema)`).          | N/A                                                                                                                                                     | `Schema.Schema<"platformio" \| "arduino" \| null, "platformio" \| "arduino" \| null>`                                                                | `useLocalStorage` catches `ParseError` on invalid string and returns `null`.                 | `apps/web/src/state/toolchain.ts`, `apps/web/src/hooks/useLocalStorage.ts`                                                                    |
| 3   | React Hook Contract         | `useActiveToolchain()`                      | Persistent React state hook bound to `localStorage` key `"embedino-active-toolchain"`.                 | None                                                                                                                                                    | `[ActiveToolchain, (value: ActiveToolchain \| ((val: ActiveToolchain) => ActiveToolchain)) => void]`                                                 | Catches read/decode errors, falls back to `null`, syncs via `StorageEvent` and custom event. | `apps/web/src/state/toolchain.ts`, `apps/web/src/components/wiring/ToolchainSetup.tsx`, `apps/web/src/components/settings/SettingsPanels.tsx` |
| 4   | State Runtime Command       | `toolchainGetStatusCommand`                 | Unary RPC command fetching installation status for PlatformIO and Arduino CLI from environment server. | `{ readonly environmentId: EnvironmentId }`                                                                                                             | `ToolchainStatus` (`{ platformioInstalled: boolean, platformioVersion: string \| null, arduinoInstalled: boolean, arduinoVersion: string \| null }`) | Returns `AtomCommandFailure` on RPC transport failure or missing environment.                | `apps/web/src/state/toolchain.ts`, `packages/contracts/src/toolchain.ts`                                                                      |
| 5   | State Runtime Command       | `toolchainInstallCommand`                   | Streaming RPC command installing requested toolchain via python pip or powershell script.              | `{ readonly environmentId: EnvironmentId; readonly type: "platformio" \| "arduino"; readonly onProgress: (progress: number, stdout?: string) => void }` | `void` (streams `ToolchainInstallProgressEvent` to callback)                                                                                         | Fails stream with `ToolchainInstallError` on non-zero exit code or spawn error.              | `apps/web/src/state/toolchain.ts`, `packages/contracts/src/toolchain.ts`, `apps/server/src/toolchain/ToolchainService.ts`                     |

---

## Edge Cases

| #   | Feature                     | Input                                                                            | Observed Behavior                                                                                                             |
| --- | --------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | `useActiveToolchain`        | `localStorage` item `"embedino-active-toolchain"` set to `"invalid"` or `"gcc"`. | `Schema.decodeSync` throws `ParseError`. `useLocalStorage` catches the error, logs warning, and returns initial value `null`. |
| 2   | `useActiveToolchain`        | `localStorage` item `"embedino-active-toolchain"` is missing (`null`).           | `useLocalStorage` returns default `initialValue` (`null`).                                                                    |
| 3   | `toolchainGetStatusCommand` | Invalid `environmentId` or disconnected client connection.                       | `EnvironmentRegistry.run` fails with `EnvironmentNotRegisteredError` or `EnvironmentRpcUnavailableError`.                     |
| 4   | `toolchainInstallCommand`   | Installation process interrupted or non-zero exit code returned.                 | Streaming `Stream.runDrain` fails with `ToolchainInstallError` containing exit code or process error message.                 |

---

## 5-Component Handoff Report

### 1. Observation

Direct inspection of `apps/web/src/state/toolchain.ts` lines 73–78 revealed an unsafe type assertion and generic override bypassing Effect Schema validation:

```ts
// apps/web/src/state/toolchain.ts:73-78
export function useActiveToolchain() {
  return useLocalStorage<"platformio" | "arduino" | null, any>(
    "embedino-active-toolchain",
    null,
    Schema.String as any,
  );
}
```

Further inspection of `apps/web/src/hooks/useLocalStorage.ts` lines 43–57 and 100–103 showed:

```ts
// apps/web/src/hooks/useLocalStorage.ts:43-57,100-103
const decode = <T, E>(key: string, schema: Schema.Codec<T, E>, value: string) => {
  try {
    return Schema.decodeSync(Schema.fromJsonString(schema))(value);
  } catch (cause) {
    throw new LocalStorageOperationError({ operation: "decode", storageKey: key, cause });
  }
};

export function useLocalStorage<T, E>(
  key: string,
  initialValue: T,
  schema: Schema.Codec<T, E>,
): [T, (value: T | ((val: T) => T)) => void];
```

Inspection of `packages/contracts/src/toolchain.ts` confirmed that contracts define `ToolchainStatus`, `ToolchainInstallProgressEvent`, and `ToolchainInstallError`, but do not define a schema or type for active toolchain preference (`"platformio" | "arduino" | null`).

---

### 2. Logic Chain

1. `useLocalStorage` wraps its schema argument with `Schema.fromJsonString(schema)` for JSON string encoding and decoding.
2. Passing `Schema.String as any` forces `useLocalStorage` to treat any arbitrary string in `localStorage` as valid, preventing runtime schema validation and requiring explicit `<"platformio" | "arduino" | null, any>` generic casts.
3. Defining `ToolchainTypeSchema = Schema.Literal("platformio", "arduino")` and `ActiveToolchainSchema = Schema.NullOr(ToolchainTypeSchema)` creates a strongly typed Effect Schema matching `Schema.Codec<"platformio" | "arduino" | null, "platformio" | "arduino" | null>`.
4. Passing `ActiveToolchainSchema` directly to `useLocalStorage` allows TypeScript to automatically infer `T = ActiveToolchain` (`"platformio" | "arduino" | null`) and `E = ActiveToolchain` without any `as any` type assertions.
5. If invalid data is written to `localStorage`, `ActiveToolchainSchema` rejects it during `Schema.decodeSync`, allowing `useLocalStorage` to safely catch the error and fall back to `null`.

---

### 3. Caveats

- **No Schema Changes to `@t3tools/contracts` Required**: `ActiveToolchainSchema` and `ActiveToolchain` can be exported directly from `apps/web/src/state/toolchain.ts` (or placed in `@t3tools/contracts` if needed elsewhere).
- **Read-Only Scope**: No source files were modified during this specification mining task.

---

### 4. Conclusion

To fix the AI smell and eliminate unsafe `any` casts in `apps/web/src/state/toolchain.ts`, update the file with the following exact replacement code structure:

```ts
import { EnvironmentId, WS_METHODS } from "@t3tools/contracts";
import { EnvironmentRegistry } from "@t3tools/client-runtime/connection";
import { request, runStream } from "@t3tools/client-runtime/rpc";
import { createRuntimeCommand } from "@t3tools/client-runtime/state/runtime";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import { useLocalStorage } from "~/hooks/useLocalStorage";

import { connectionAtomRuntime } from "../connection/runtime";

// ---------------------------------------------------------------------------
// Toolchain Schemas & Types
// ---------------------------------------------------------------------------

export const ToolchainTypeSchema = Schema.Literal("platformio", "arduino");
export type ToolchainType = Schema.Schema.Type<typeof ToolchainTypeSchema>;

export const ActiveToolchainSchema = Schema.NullOr(ToolchainTypeSchema);
export type ActiveToolchain = Schema.Schema.Type<typeof ActiveToolchainSchema>;

// ---------------------------------------------------------------------------
// toolchainGetStatus — unary RPC via createRuntimeCommand
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
// useActiveToolchain Hook
// ---------------------------------------------------------------------------

export function useActiveToolchain(): [
  ActiveToolchain,
  (value: ActiveToolchain | ((val: ActiveToolchain) => ActiveToolchain)) => void,
] {
  return useLocalStorage("embedino-active-toolchain", null, ActiveToolchainSchema);
}
```

---

### 5. Verification Method

To verify the proposed schema replacement:

1. Run typecheck across the monorepo:
   ```bash
   pnpm typecheck
   ```
2. Verify zero occurrences of `as any` remain in `apps/web/src/state/toolchain.ts`:
   ```bash
   pnpm lint
   ```
