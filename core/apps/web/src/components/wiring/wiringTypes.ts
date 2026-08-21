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
    label: "From (Source)",
    minWidth: "w-[180px]",
    defaultRequired: true,
    hasData: () => true,
  },
  {
    key: "wireColor",
    label: "Wire Color",
    minWidth: "w-[110px]",
    hasData: (conns) => conns.some((c) => Boolean(c.wireColor && c.wireColor.trim().length > 0)),
  },
  {
    key: "signal",
    label: "Signal / Bus",
    minWidth: "w-[130px]",
    hasData: (conns) =>
      conns.some(
        (c) =>
          Boolean(c.signal && c.signal.trim().length > 0) ||
          Boolean(c.signalType && c.signalType.trim().length > 0),
      ),
  },
  {
    key: "to",
    label: "To (Target)",
    minWidth: "w-[180px]",
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

export const WIRE_COLOR_MAP: Record<string, string> = {
  red: "#ef4444",
  black: "#1e293b",
  yellow: "#eab308",
  blue: "#3b82f6",
  green: "#22c55e",
  white: "#f8fafc",
  orange: "#f97316",
  purple: "#a855f7",
  brown: "#78350f",
  gray: "#64748b",
};
