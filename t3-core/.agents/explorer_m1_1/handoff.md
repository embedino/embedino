# Refactoring Strategy & Replacement Plan Report: M1 Toolchain Setup (`ToolchainSetup.tsx` & `toolchain.ts`)

**Working Directory**: `apps/web/src`  
**Author**: M1 Toolchain Setup Explorer (`explorer_m1_1`)  
**Date**: 2026-08-12

---

## 1. Observation

A detailed read-only code audit of `apps/web/src/components/wiring/ToolchainSetup.tsx` and `apps/web/src/state/toolchain.ts` revealed four major categories of defects:

### 1.1 Raw Mutable Singleton Hack (`ToolchainSetup.tsx`, Lines 21–51)

`ToolchainSetup.tsx` contains an ad-hoc module-level mutable singleton state object (`let state: ToolchainGlobalState = { ... }`) combined with a custom listener `Set<() => void>` and `useSyncExternalStore` subscription. This bypasses the codebase's central reactive state system (`appAtomRegistry` and `@effect/atom` / `effect/unstable/reactivity`), hindering testability and state coherence across environment switching.

### 1.2 TypeScript Compilation Errors (6 Errors in `ToolchainSetup.tsx`)

Running `pnpm typecheck` (`tsgo --noEmit`) produces 6 specific compilation failures:

1. `src/components/wiring/ToolchainSetup.tsx(164,9)`: `error TS2304: Cannot find name 'fetchStatus'.`
2. `src/components/wiring/ToolchainSetup.tsx(167,25)`: `error TS2339: Property 'failures' does not exist on type 'Cause<...>'`
3. `src/components/wiring/ToolchainSetup.tsx(168,25)`: `error TS2339: Property 'failures' does not exist on type 'Cause<...>'`
4. `src/components/wiring/ToolchainSetup.tsx(174,47)`: `error TS2304: Cannot find name 'fetchStatus'.`
5. `src/components/wiring/ToolchainSetup.tsx(260,18)`: `error TS2304: Cannot find name 'fetchStatus'.`
6. `src/components/wiring/ToolchainSetup.tsx(315,57)`: `error TS2339: Property 'error' does not exist on type 'Failure<void, ...>'`

**Root Causes**:

- `fetchStatus` (lines 67–90) was declared locally inside a `useEffect` closure inside `useToolchainState()`, rendering it inaccessible to `ToolchainSetupPill` (lines 164, 174, 260).
- `result.cause` from an `AtomCommandResult` is an Effect `Cause` object, which does not have a `.failures` property.
- `result` on failure (`_tag === "Failure"`) does not have a `.error` string property; error extraction requires standard `Cause.squash(result.cause)`.

### 1.3 Unused Code, Console Logs & Bypassed Schema Types

- **Unused Callback**: `handleInstall` (lines 129–175) in `ToolchainSetupPill` is defined but never invoked because installation UI controls reside exclusively in `ToolchainSetupDialog`. This causes `eslint(no-unused-vars)`.
- **Debug Logs**: Production code contains `console.log("[Toolchain] Starting install:...", ...)` (lines 141, 149, 154).
- **Unsafe Schema Cast (`toolchain.ts`, Line 77)**: `useActiveToolchain()` uses `Schema.String as any` instead of a strongly typed `Schema.NullOr(Schema.Literal("platformio", "arduino"))`, bypassing schema validation for local storage.

### 1.4 Hardcoded CSS Hex Values (`ToolchainSetup.tsx`)

UI elements use hardcoded dark hex color strings (`#111111`, `#2A2A2A`, `#1A1A1A`, `#222222`, `#2B60FF`, `#141d18`, `#A0A0A0`, `#E0E0E0`, `#3A3A3A`) instead of standard Tailwind CSS semantic theme tokens (`bg-background`, `border-border`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `bg-secondary`, etc.).

---

## 2. Logic Chain

1. **State Store Architecture**: Moving the toolchain global state from component-local `let state` into `apps/web/src/state/toolchain.ts` as an Effect Atom (`toolchainStateAtom = Atom.make<ToolchainState>(initialToolchainState)`) aligns toolchain state management with `activeEnvironmentIdAtom` and `appAtomRegistry`. Components read state using `useAtomValue(toolchainStateAtom)` and update state via `updateToolchainState(patch)`.
2. **Scoping & Callbacks**: Exposing `fetchStatus` as part of the `useToolchainState()` return object (`{ snap, fetchStatus }`) and removing the duplicate unused `handleInstall` callback in `ToolchainSetupPill` eliminates out-of-scope function references (fixing TS2304 errors on lines 164, 174, 260) and satisfies ESLint `no-unused-vars`.
3. **Effect Error Handling**: Replacing `.failures` and `.error` property access with Effect's canonical `Cause.squash(result.cause)` extracts printable error messages safely while ensuring full type safety (fixing TS2339 errors on lines 167, 168, 315).
4. **Theme Alignment**: Replacing inline hex values with Tailwind semantic theme tokens (`border-border`, `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `bg-primary`) guarantees proper light/dark theme adaptability across the application.

---

## 3. Caveats

- **Effect Atom Reactivity**: Updating `toolchainStateAtom` via `appAtomRegistry.update(...)` requires `appAtomRegistry` to be initialized, which is standard in the app's React root tree (`AppAtomRegistryProvider`).
- **Settings Component Integration**: Note that `SettingsPanels.tsx` select dropdown locking behavior (R1.3) should be addressed alongside these changes to ensure selecting "Manage Toolchain..." in Settings resets back to `activeToolchain ?? "none"` when closed.

---

## 4. Conclusion & Complete Step-by-Step Code Replacement Plans

### 4.1 Step-by-Step Replacement Plan: `apps/web/src/state/toolchain.ts`

Replace the entire contents of `apps/web/src/state/toolchain.ts` with the following code:

```typescript
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
  readonly arduinoInstalled: boolean;
  readonly arduinoVersion: string | null;
  readonly statusLoaded: boolean;
}

export const initialToolchainState: ToolchainState = {
  installing: null,
  progress: 0,
  error: null,
  platformioInstalled: false,
  platformioVersion: null,
  arduinoInstalled: false,
  arduinoVersion: null,
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
  type: "platformio" | "arduino",
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
    readonly type: "platformio" | "arduino";
    readonly onProgress: (progress: number, stdout?: string) => void;
  }) => installToolchainEffect(input.environmentId, input.type, input.onProgress),
});

// ---------------------------------------------------------------------------
// LocalStorage hook for active toolchain preference
// ---------------------------------------------------------------------------

export type ActiveToolchain = "platformio" | "arduino" | null;
export const ActiveToolchainSchema = Schema.NullOr(Schema.Literal("platformio", "arduino"));

export function useActiveToolchain() {
  return useLocalStorage<ActiveToolchain, ActiveToolchain>(
    "embedino-active-toolchain",
    null,
    ActiveToolchainSchema,
  );
}
```

---

### 4.2 Step-by-Step Replacement Plan: `apps/web/src/components/wiring/ToolchainSetup.tsx`

Replace the entire contents of `apps/web/src/components/wiring/ToolchainSetup.tsx` with the following code:

```typescript
import { ArrowDownCircle, Check, Download, Info, X, AlertTriangle, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAtomValue } from "@effect/atom-react";
import * as Cause from "effect/Cause";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { primaryEnvironmentIdAtom } from "~/state/primaryEnvironment";
import { useAtomCommand } from "~/state/use-atom-command";
import {
  toolchainGetStatusCommand,
  toolchainInstallCommand,
  toolchainStateAtom,
  updateToolchainState,
  useActiveToolchain,
} from "~/state/toolchain";

// ---------------------------------------------------------------------------
// Global hook for toolchain state & status fetching
// ---------------------------------------------------------------------------
export function useToolchainState() {
  const environmentId = useAtomValue(primaryEnvironmentIdAtom);
  const snap = useAtomValue(toolchainStateAtom);
  const getStatus = useAtomCommand(toolchainGetStatusCommand, {
    label: "toolchain-get-status",
    reportFailure: false,
  });

  const fetchStatus = useCallback(
    async (retries = 3) => {
      if (!environmentId) return;

      const result = await getStatus({ environmentId });

      if (result._tag === "Success") {
        const s = result.value as {
          platformioInstalled: boolean;
          platformioVersion: string | null;
          arduinoInstalled: boolean;
          arduinoVersion: string | null;
        };
        updateToolchainState({
          platformioInstalled: s.platformioInstalled,
          platformioVersion: s.platformioVersion,
          arduinoInstalled: s.arduinoInstalled,
          arduinoVersion: s.arduinoVersion,
          statusLoaded: true,
        });
      } else if (retries > 0) {
        setTimeout(() => void fetchStatus(retries - 1), 2000);
      } else {
        updateToolchainState({ statusLoaded: true });
      }
    },
    [environmentId, getStatus],
  );

  useEffect(() => {
    if (!environmentId || snap.statusLoaded) return;
    void fetchStatus();
  }, [environmentId, snap.statusLoaded, fetchStatus]);

  return { snap, fetchStatus };
}

// ---------------------------------------------------------------------------
// Toolchain Setup Pill Component
// ---------------------------------------------------------------------------
export function ToolchainSetupPill() {
  const [open, setOpen] = useState(false);
  const [activeToolchain, setActiveToolchain] = useActiveToolchain();
  const { snap, fetchStatus } = useToolchainState();

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-toolchain-dialog", handleOpen);
    return () => window.removeEventListener("open-toolchain-dialog", handleOpen);
  }, []);

  // Auto-select toolchain if none is selected but one is installed
  useEffect(() => {
    if (snap.statusLoaded && !activeToolchain) {
      if (snap.platformioInstalled) setActiveToolchain("platformio");
      else if (snap.arduinoInstalled) setActiveToolchain("arduino");
    }
  }, [snap.statusLoaded, snap.platformioInstalled, snap.arduinoInstalled, activeToolchain, setActiveToolchain]);

  // Error banner auto-dismiss after 6s
  useEffect(() => {
    if (snap.error) {
      const timer = setTimeout(() => updateToolchainState({ error: null }), 6000);
      return () => clearTimeout(timer);
    }
  }, [snap.error]);

  // Installing state — full-width progress bar
  if (snap.installing) {
    return (
      <div className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-background p-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            Installing {snap.installing === "platformio" ? "PlatformIO" : "Arduino CLI"}
          </span>
          <button
            type="button"
            onClick={() => updateToolchainState({ installing: null, progress: 0 })}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Cancel"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-muted py-2">
          <div
            className="absolute left-0 top-0 h-full bg-primary/30 transition-all duration-300 ease-out"
            style={{ width: `${snap.progress}%` }}
          />
          <span className="relative z-10 text-sm font-medium text-foreground">
            {snap.progress}% Completed
          </span>
        </div>
      </div>
    );
  }

  // Error state — inline error banner
  if (snap.error) {
    return (
      <div className="flex w-full flex-col gap-2 rounded-2xl border border-destructive/50 bg-destructive/10 p-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-destructive">
            <AlertTriangle className="size-4" />
            Installation Error
          </span>
          <button
            type="button"
            onClick={() => updateToolchainState({ error: null })}
            className="text-destructive/80 transition-colors hover:text-destructive"
            aria-label="Dismiss error"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="text-sm text-destructive/90">{snap.error}</p>
      </div>
    );
  }

  // Default state — Getting Started
  const isAnyInstalled = snap.platformioInstalled || snap.arduinoInstalled;

  if (!snap.statusLoaded) return null;
  if (isAnyInstalled) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (val) void fetchStatus();
      }}
    >
      <div className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-background p-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-foreground">
            Getting Started
          </span>
        </div>
        <DialogTrigger className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-muted py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <ArrowDownCircle className="size-4" />
          <span>Configure Toolchain</span>
        </DialogTrigger>
      </div>

      <ToolchainSetupDialog />
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Toolchain Setup Dialog Component
// ---------------------------------------------------------------------------
export function ToolchainSetupDialog() {
  const environmentId = useAtomValue(primaryEnvironmentIdAtom);
  const [activeToolchain, setActiveToolchain] = useActiveToolchain();
  const { snap, fetchStatus } = useToolchainState();
  const install = useAtomCommand(toolchainInstallCommand, {
    label: "toolchain-install",
    reportFailure: false,
  });

  const handleInstall = useCallback(
    async (type: "platformio" | "arduino") => {
      if (!environmentId) {
        updateToolchainState({ error: "No environment connected. Please wait for the connection." });
        return;
      }
      if (snap.installing) return;

      updateToolchainState({ installing: type, progress: 0, error: null });

      const result = await install({
        environmentId,
        type,
        onProgress: (p: number) => {
          updateToolchainState({ progress: p });
        },
      });

      if (result._tag === "Success") {
        updateToolchainState({
          installing: null,
          platformioInstalled: type === "platformio" ? true : snap.platformioInstalled,
          arduinoInstalled: type === "arduino" ? true : snap.arduinoInstalled,
        });
        if (!activeToolchain) setActiveToolchain(type);
        void fetchStatus();
      } else {
        const cause = Cause.squash(result.cause);
        const errMsg =
          cause instanceof Error
            ? cause.message
            : typeof cause === "string"
              ? cause
              : "Installation failed. Check the console for details.";
        updateToolchainState({ installing: null, progress: 0, error: errMsg });
      }
    },
    [environmentId, install, snap, activeToolchain, setActiveToolchain, fetchStatus],
  );

  return (
    <DialogPopup className="max-w-xl">
      <DialogHeader className="pb-2">
        <DialogTitle className="flex items-center gap-2 text-foreground">
          <ArrowDownCircle className="size-6" />
          Configure Toolchain
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Select and install a build engine to compile and flash your embedded project.
        </DialogDescription>
      </DialogHeader>

      <DialogPanel className="flex flex-col gap-4 p-6 pt-2">
        {/* PlatformIO Card */}
        <div
          className={`flex flex-col gap-4 rounded-xl border p-5 transition-all ${
            activeToolchain === "platformio"
              ? "border-emerald-600/50 bg-emerald-950/20"
              : "border-border bg-card hover:border-border/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-foreground">PlatformIO</span>
              {snap.platformioInstalled ? (
                <span className="flex items-center gap-1 rounded-full border border-emerald-800/50 bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                  <Check className="size-3" />
                  INSTALLED
                </span>
              ) : (
                <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold tracking-wide text-primary">
                  RECOMMENDED
                </span>
              )}
            </div>
            <Button
              variant={snap.platformioInstalled ? (activeToolchain === "platformio" ? "outline" : "secondary") : "default"}
              className={
                snap.platformioInstalled
                  ? activeToolchain === "platformio"
                    ? "cursor-default border-emerald-800/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/40"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }
              onClick={() => {
                if (snap.platformioInstalled) {
                  if (activeToolchain !== "platformio") setActiveToolchain("platformio");
                } else {
                  void handleInstall("platformio");
                }
              }}
            >
              {snap.platformioInstalled ? (
                activeToolchain === "platformio" ? (
                  <>Selected</>
                ) : (
                  <>Select</>
                )
              ) : (
                <>
                  <Download className="mr-2 size-4" />
                  Install
                </>
              )}
            </Button>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Professional multi-platform build engine, supports 1,000+ boards, ESP-IDF, FreeRTOS,
            and library management.
          </p>
        </div>

        {/* Arduino CLI Card */}
        <div
          className={`flex flex-col gap-4 rounded-xl border p-5 transition-all ${
            activeToolchain === "arduino"
              ? "border-emerald-600/50 bg-emerald-950/20"
              : "border-border bg-card hover:border-border/80"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-foreground">Arduino CLI</span>
              {snap.arduinoInstalled && (
                <span className="flex items-center gap-1 rounded-full border border-emerald-800/50 bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                  <Check className="size-3" />
                  INSTALLED
                </span>
              )}
            </div>
            <Button
              variant={snap.arduinoInstalled ? (activeToolchain === "arduino" ? "outline" : "secondary") : "outline"}
              className={
                snap.arduinoInstalled
                  ? activeToolchain === "arduino"
                    ? "cursor-default border-emerald-800/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/40"
                    : "bg-secondary border-border text-secondary-foreground hover:bg-secondary/80"
                  : "border-border bg-transparent text-foreground hover:bg-accent"
              }
              onClick={() => {
                if (snap.arduinoInstalled) {
                  if (activeToolchain !== "arduino") setActiveToolchain("arduino");
                } else {
                  void handleInstall("arduino");
                }
              }}
            >
              {snap.arduinoInstalled ? (
                activeToolchain === "arduino" ? (
                  <>Selected</>
                ) : (
                  <>Select</>
                )
              ) : (
                <>
                  <Download className="mr-2 size-4" />
                  Install
                </>
              )}
            </Button>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Official lightweight Arduino command line toolchain for quick sketching and AVR and
            SAMD boards.
          </p>
        </div>
      </DialogPanel>

      <div className="rounded-b-[calc(var(--radius-2xl)-1px)] bg-background px-6 py-4">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
          <Info className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            This will be installed globally on your system.
          </span>
        </div>
      </div>
    </DialogPopup>
  );
}
```

---

## 5. Verification Method

To verify these changes after implementation, execute the following commands from project root (`c:\Users\rapid\Desktop\embedino workspace\t3-core`):

1. **TypeScript Type Checking**:

   ```bash
   pnpm typecheck
   ```

   _Expected Output_: Exit status 0 with zero compilation errors in `@t3tools/web`.

2. **Linter Verification**:

   ```bash
   pnpm lint
   ```

   _Expected Output_: Exit status 0 with zero ESLint warnings regarding unused `handleInstall` variable.

3. **Frontend Production Build**:
   ```bash
   pnpm build
   ```
   _Expected Output_: Build completed successfully.
