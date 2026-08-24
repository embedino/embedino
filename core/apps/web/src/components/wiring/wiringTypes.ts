import type { CircuitConnection } from "@embedino/contracts";

export type TableColumnKey = "from" | "wireColor" | "signal" | "to" | "voltage" | "notes";

export interface TableColumnDef {
  readonly key: TableColumnKey;
  readonly label: string;
  readonly minWidth?: string;
  readonly defaultRequired?: boolean;
  readonly hasData: (connections: readonly CircuitConnection[]) => boolean;
}

export const TABLE_COLUMNS: readonly TableColumnDef[] = [
  {
    key: "from",
    label: "From",
    minWidth: "w-[170px]",
    defaultRequired: true,
    hasData: () => true,
  },
  {
    key: "wireColor",
    label: "Wire",
    minWidth: "w-[100px]",
    hasData: (conns) => conns.some((c) => Boolean(c.wireColor && c.wireColor.trim().length > 0)),
  },
  {
    key: "signal",
    label: "Signal",
    minWidth: "w-[110px]",
    hasData: (conns) =>
      conns.some(
        (c) =>
          Boolean(c.signal && c.signal.trim().length > 0) ||
          Boolean(c.signalType && c.signalType.trim().length > 0),
      ),
  },
  {
    key: "to",
    label: "To",
    minWidth: "w-[170px]",
    defaultRequired: true,
    hasData: () => true,
  },
  {
    key: "voltage",
    label: "Voltage",
    minWidth: "w-[90px]",
    hasData: (conns) => conns.some((c) => Boolean(c.voltage && c.voltage.trim().length > 0)),
  },
  {
    key: "notes",
    label: "Notes",
    minWidth: "min-w-[140px]",
    hasData: (conns) => conns.some((c) => Boolean(c.notes && c.notes.trim().length > 0)),
  },
] as const;

/**
 * Swatch colors tuned to stay legible on both light and dark card surfaces —
 * dark hues (black, brown) are lifted just enough to not vanish into the
 * dark-theme background, while vivid hues stay recognizable as real wire colors.
 */
export const WIRE_COLOR_MAP: Record<string, string> = {
  red: "#f87171",
  black: "#52525b",
  yellow: "#facc15",
  blue: "#60a5fa",
  green: "#4ade80",
  white: "#f8fafc",
  orange: "#fb923c",
  purple: "#c084fc",
  brown: "#b45309",
  gray: "#94a3b8",
  custom: "#22d3ee",
};

/** Neutral fallback for wire colors that are not in the map. */
export const WIRE_COLOR_FALLBACK = "#71717a";
