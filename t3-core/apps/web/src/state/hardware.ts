import { Atom } from "effect/unstable/reactivity";
import { appAtomRegistry } from "~/rpc/atomRegistry";
import type { HardwareDevice, HardwareEvent } from "@t3tools/contracts";
import { EnvironmentId, WS_METHODS } from "@t3tools/contracts";
import { EnvironmentRegistry } from "@t3tools/client-runtime/connection";
import { subscribe } from "@t3tools/client-runtime/rpc";
import { createRuntimeCommand } from "@t3tools/client-runtime/state/runtime";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { useEffect } from "react";
import { connectionAtomRuntime } from "../connection/runtime";
import { useAtomCommand } from "./use-atom-command";
export interface HardwareState {
  /** All currently connected devices from the backend. */
  readonly connectedDevices: readonly HardwareDevice[];
  /** The active/selected device id for the current project. */
  readonly activeDeviceId: string | null;
  /** The board name of the project's target (persists even when offline). */
  readonly targetBoardName: string | null;
  /** The port display name when connected. */
  readonly targetPortDisplay: string | null;
  /** Whether the active target is currently connected. */
  readonly isOnline: boolean;
  /** Whether initial scan has completed. */
  readonly initialized: boolean;
}

export const initialHardwareState: HardwareState = {
  connectedDevices: [],
  activeDeviceId: null,
  targetBoardName: null,
  targetPortDisplay: null,
  isOnline: false,
  initialized: false,
};

export const hardwareStateAtom = Atom.make<HardwareState>(initialHardwareState).pipe(
  Atom.keepAlive,
  Atom.withLabel("web-hardware-state"),
);

export function updateHardwareState(patch: Partial<HardwareState>): void {
  appAtomRegistry.update(hardwareStateAtom, (current) => ({
    ...current,
    ...patch,
  }));
}

// Helper to get the active device object
export function getActiveDevice(state: HardwareState): HardwareDevice | null {
  if (!state.activeDeviceId) return null;
  return state.connectedDevices.find((d) => d.id === state.activeDeviceId) ?? null;
}

// Helper to count connected devices
export function getConnectedDeviceCount(state: HardwareState): number {
  return state.connectedDevices.length;
}

// ---------------------------------------------------------------------------
// hardwareListDevices — unary RPC via createRuntimeCommand
// ---------------------------------------------------------------------------

// Unary RPC removed - we rely on the subscription stream to deliver the initial snapshot instead.

// ---------------------------------------------------------------------------
// hardwareSubscribeDevices — streaming RPC via createRuntimeCommand
// ---------------------------------------------------------------------------

function subscribeDevicesEffect(environmentId: EnvironmentId, signal?: AbortSignal) {
  return Effect.gen(function* () {
    const registry = yield* EnvironmentRegistry;
    const streamEffect = registry
      .runStream(
        environmentId,
        subscribe(WS_METHODS.hardwareSubscribeDevices, {}).pipe(
          Stream.tap((event: HardwareEvent) =>
            Effect.sync(() => {
              if (event.type === "snapshot") {
                appAtomRegistry.update(hardwareStateAtom, (current) => {
                  const isStillConnected = current.activeDeviceId
                    ? event.devices.some((d) => d.id === current.activeDeviceId)
                    : false;

                  return {
                    ...current,
                    connectedDevices: event.devices,
                    initialized: true,
                    isOnline: current.activeDeviceId ? isStillConnected : false,
                  };
                });
              }
            }),
          ),
        ),
      )
      .pipe(Stream.runDrain);

    if (signal) {
      const abortEffect = Effect.tryPromise({
        try: () =>
          new Promise<void>((resolve) => {
            if (signal.aborted) {
              resolve();
              return;
            }
            const handler = () => resolve();
            signal.addEventListener("abort", handler);
          }),
        catch: () => {},
      });
      return yield* Effect.raceFirst(streamEffect, abortEffect);
    }

    return yield* streamEffect;
  });
}

export const hardwareSubscribeDevicesCommand = createRuntimeCommand(connectionAtomRuntime, {
  label: "hardware-subscribe-devices",
  execute: (
    input: { readonly environmentId: EnvironmentId; readonly signal?: AbortSignal },
    _registry,
  ) => subscribeDevicesEffect(input.environmentId, input.signal),
});

export function useHardwareSubscription(environmentId: EnvironmentId | null) {
  const subscribe = useAtomCommand(hardwareSubscribeDevicesCommand, {
    label: "use-hardware-subscription",
    reportFailure: false,
  });

  useEffect(() => {
    if (!environmentId) return;
    const abortController = new AbortController();
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const start = () => {
      if (abortController.signal.aborted) return;
      subscribe({ environmentId, signal: abortController.signal })
        .then(() => {
          if (abortController.signal.aborted) return;
          // Stream ended unexpectedly (e.g. WS disconnect), reconnect
          retryTimeout = setTimeout(start, 2000);
        })
        .catch((err) => {
          if (abortController.signal.aborted) return;
          if (err?.message === "Aborted") return;
          // Subscription failed (e.g. server not ready), retry
          retryTimeout = setTimeout(start, 2000);
        });
    };

    start();

    return () => {
      abortController.abort();
      if (retryTimeout !== null) clearTimeout(retryTimeout);
    };
  }, [environmentId, subscribe]);
}
