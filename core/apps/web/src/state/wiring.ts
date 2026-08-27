import { scopedThreadKey } from "@embedino/client-runtime/environment";
import type { CircuitWiringDiagram, ScopedThreadRef } from "@embedino/contracts";
import { parseCircuitWiringJson } from "@embedino/contracts";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { NetColorMode } from "../components/wiring/signalColors";
import { resolveStorage } from "../lib/storage";

export type WiringViewerTab = "diagram" | "table";

export interface ThreadWiringState {
  code: string | null;
  fenceTitle?: string | undefined;
  circuit: CircuitWiringDiagram | null;
  parseError: string | null;
  selectedComponentId: string | null;
  hidePowerGnd: boolean;
  activeTab: WiringViewerTab;
  columnOverrides: Record<string, boolean>;
}

const DEFAULT_THREAD_WIRING_STATE: ThreadWiringState = {
  code: null,
  fenceTitle: undefined,
  circuit: null,
  parseError: null,
  selectedComponentId: null,
  hidePowerGnd: false,
  activeTab: "diagram",
  columnOverrides: {},
};

export const GLOBAL_WIRING_THREAD_KEY = "__global_wiring__";

export function resolveThreadKey(ref?: ScopedThreadRef | undefined): string {
  if (!ref) return GLOBAL_WIRING_THREAD_KEY;
  return scopedThreadKey(ref);
}

interface WiringStoreState {
  byThreadKey: Record<string, ThreadWiringState>;
  /** Global appearance preference: how pin names & net labels are colored. */
  netColorMode: NetColorMode;
  /** Global appearance preference: derive jumper colors from signal type when unspecified. */
  suggestWireColors: boolean;
  getThreadState: (ref?: ScopedThreadRef | undefined) => ThreadWiringState;
  setCircuit: (
    ref: ScopedThreadRef | undefined,
    code: string,
    fenceTitle?: string | undefined,
  ) => void;
  setNetColorMode: (mode: NetColorMode) => void;
  setSuggestWireColors: (suggest: boolean) => void;
  setSelectedComponent: (ref: ScopedThreadRef | undefined, componentId: string | null) => void;
  setHidePowerGnd: (ref: ScopedThreadRef | undefined, hide: boolean) => void;
  setActiveTab: (ref: ScopedThreadRef | undefined, tab: WiringViewerTab) => void;
  setColumnOverride: (
    ref: ScopedThreadRef | undefined,
    columnKey: string,
    visible: boolean,
  ) => void;
  clearCircuit: (ref: ScopedThreadRef | undefined) => void;
  removeThread: (ref: ScopedThreadRef) => void;
}

export const useWiringStore = create<WiringStoreState>()(
  persist(
    (set, get) => ({
      byThreadKey: {},
      netColorMode: "signal",
      suggestWireColors: true,

      getThreadState: (ref) => {
        const key = resolveThreadKey(ref);
        return get().byThreadKey[key] ?? DEFAULT_THREAD_WIRING_STATE;
      },

      setCircuit: (ref, code, fenceTitle) => {
        const key = resolveThreadKey(ref);
        let circuit: CircuitWiringDiagram | null = null;
        let parseError: string | null = null;

        try {
          circuit = parseCircuitWiringJson(code);
        } catch (err: any) {
          parseError = err?.message ?? String(err);
        }

        set((state) => {
          const prev = state.byThreadKey[key] ?? DEFAULT_THREAD_WIRING_STATE;
          return {
            byThreadKey: {
              ...state.byThreadKey,
              [key]: {
                ...prev,
                code,
                fenceTitle,
                circuit,
                parseError,
                // Reset selected component when a new circuit is loaded
                selectedComponentId: null,
              },
            },
          };
        });
      },

      setNetColorMode: (mode) => {
        set((state) => ({ netColorMode: mode }));
      },

      setSuggestWireColors: (suggest) => {
        set((state) => ({ suggestWireColors: suggest }));
      },

      setSelectedComponent: (ref, componentId) => {
        const key = resolveThreadKey(ref);
        set((state) => {
          const prev = state.byThreadKey[key] ?? DEFAULT_THREAD_WIRING_STATE;
          return {
            byThreadKey: {
              ...state.byThreadKey,
              [key]: {
                ...prev,
                selectedComponentId: componentId,
              },
            },
          };
        });
      },

      setHidePowerGnd: (ref, hide) => {
        const key = resolveThreadKey(ref);
        set((state) => {
          const prev = state.byThreadKey[key] ?? DEFAULT_THREAD_WIRING_STATE;
          return {
            byThreadKey: {
              ...state.byThreadKey,
              [key]: {
                ...prev,
                hidePowerGnd: hide,
              },
            },
          };
        });
      },

      setActiveTab: (ref, tab) => {
        const key = resolveThreadKey(ref);
        set((state) => {
          const prev = state.byThreadKey[key] ?? DEFAULT_THREAD_WIRING_STATE;
          return {
            byThreadKey: {
              ...state.byThreadKey,
              [key]: {
                ...prev,
                activeTab: tab,
              },
            },
          };
        });
      },

      setColumnOverride: (ref, columnKey, visible) => {
        const key = resolveThreadKey(ref);
        set((state) => {
          const prev = state.byThreadKey[key] ?? DEFAULT_THREAD_WIRING_STATE;
          return {
            byThreadKey: {
              ...state.byThreadKey,
              [key]: {
                ...prev,
                columnOverrides: {
                  ...prev.columnOverrides,
                  [columnKey]: visible,
                },
              },
            },
          };
        });
      },

      clearCircuit: (ref) => {
        const key = resolveThreadKey(ref);
        set((state) => {
          const next = { ...state.byThreadKey };
          delete next[key];
          return { byThreadKey: next };
        });
      },

      removeThread: (ref) => {
        const key = scopedThreadKey(ref);
        set((state) => {
          const next = { ...state.byThreadKey };
          delete next[key];
          return { byThreadKey: next };
        });
      },
    }),
    {
      name: "embedino:wiring-state:v1",
      storage: createJSONStorage(() =>
        resolveStorage(typeof window !== "undefined" ? window.localStorage : undefined),
      ),
    },
  ),
);
