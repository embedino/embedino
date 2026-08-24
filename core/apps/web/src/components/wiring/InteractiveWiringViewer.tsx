import React, { useMemo, useState, useCallback } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Cpu,
  Eye,
  EyeOff,
  Palette,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  parseCircuitWiringJson,
  getCircuitBoards,
  getCircuitPeripherals,
  formatCircuitWarning,
} from "@embedino/contracts";
import {
  deriveWireColorName,
  getSignalVisual,
  resolveConnectionSignal,
  type NetColorMode,
  type SignalVisual,
} from "./signalColors";
import {
  TABLE_COLUMNS,
  WIRE_COLOR_MAP,
  WIRE_COLOR_FALLBACK,
  type TableColumnKey,
} from "./wiringTypes";
import { Button } from "~/components/ui/button";
import {
  Menu,
  MenuCheckboxItem,
  MenuPopup,
  MenuTrigger,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
} from "~/components/ui/menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tooltip, TooltipPopup, TooltipTrigger } from "~/components/ui/tooltip";
import { writeTextToClipboard } from "~/hooks/useCopyToClipboard";
import { cn } from "~/lib/utils";
import { useWiringStore } from "~/state/wiring";

export interface InteractiveWiringViewerProps {
  code: string;
  fenceTitle?: string | undefined;
  className?: string | undefined;
  selectedComponentId?: string | null | undefined;
  onSelectComponentId?: ((id: string | null) => void) | undefined;
  columnOverrides?: Record<string, boolean> | undefined;
  onColumnOverrideChange?: ((columnKey: string, visible: boolean) => void) | undefined;
}

const NET_COLOR_MODE_OPTIONS: readonly {
  value: NetColorMode;
  label: string;
  hint: string;
  preview: readonly string[];
}[] = [
  {
    value: "signal",
    label: "Signal colors",
    hint: "One hue per signal class",
    preview: ["bg-red-500", "bg-blue-500", "bg-emerald-500", "bg-slate-400"],
  },
  {
    value: "vivid",
    label: "Vivid",
    hint: "High-saturation hues",
    preview: ["bg-red-400", "bg-blue-400", "bg-emerald-400", "bg-slate-300"],
  },
  {
    value: "mono",
    label: "Mono accent",
    hint: "Single accent color",
    preview: ["bg-sky-500", "bg-sky-500/70", "bg-sky-500/40", "bg-sky-500/20"],
  },
  {
    value: "neutral",
    label: "Neutral",
    hint: "Plain text, no colors",
    preview: ["bg-zinc-400", "bg-zinc-400/70", "bg-zinc-400/40", "bg-zinc-400/20"],
  },
];

export function InteractiveWiringViewer({
  code,
  fenceTitle,
  className,
  selectedComponentId: controlledSelectedComponentId,
  onSelectComponentId,
  columnOverrides: controlledColumnOverrides,
  onColumnOverrideChange,
}: InteractiveWiringViewerProps) {
  // Internal state when not controlled
  const [internalSelectedComponentId, setInternalSelectedComponentId] = useState<string | null>(
    null,
  );
  const [internalColumnOverrides, setInternalColumnOverrides] = useState<Record<string, boolean>>(
    {},
  );
  const [hidePowerGnd, setHidePowerGnd] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Global appearance preferences (persisted across sessions)
  const netColorMode = useWiringStore((state) => state.netColorMode);
  const suggestWireColors = useWiringStore((state) => state.suggestWireColors);
  const setNetColorMode = useWiringStore((state) => state.setNetColorMode);
  const setSuggestWireColors = useWiringStore((state) => state.setSuggestWireColors);

  const selectedComponentId =
    controlledSelectedComponentId !== undefined
      ? controlledSelectedComponentId
      : internalSelectedComponentId;

  const setSelectedComponentId = useCallback(
    (id: string | null) => {
      if (onSelectComponentId) {
        onSelectComponentId(id);
      } else {
        setInternalSelectedComponentId(id);
      }
    },
    [onSelectComponentId],
  );

  const columnOverrides =
    controlledColumnOverrides !== undefined ? controlledColumnOverrides : internalColumnOverrides;

  const setColumnOverride = useCallback(
    (key: string, visible: boolean) => {
      if (onColumnOverrideChange) {
        onColumnOverrideChange(key, visible);
      } else {
        setInternalColumnOverrides((prev) => ({ ...prev, [key]: visible }));
      }
    },
    [onColumnOverrideChange],
  );

  // Parse Circuit JSON with error recovery
  const { circuit, parseError } = useMemo(() => {
    try {
      const parsed = parseCircuitWiringJson(code);
      return { circuit: parsed, parseError: null };
    } catch (err: any) {
      return { circuit: null, parseError: err?.message ?? String(err) };
    }
  }, [code]);

  const boards = useMemo(() => (circuit ? getCircuitBoards(circuit) : []), [circuit]);
  const peripherals = useMemo(() => (circuit ? getCircuitPeripherals(circuit) : []), [circuit]);

  // 1. Auto-detect which columns actually have data across all connections in the circuit
  const autoDetectedColumns = useMemo<Record<TableColumnKey, boolean>>(() => {
    const result: Record<TableColumnKey, boolean> = {
      from: true,
      wireColor: false,
      signal: false,
      to: true,
      voltage: false,
      notes: false,
    };
    if (!circuit) return result;
    for (const col of TABLE_COLUMNS) {
      result[col.key] = col.hasData(circuit.connections);
    }
    return result;
  }, [circuit]);

  // 2. Compute effective columns (overrides take precedence over auto-detection)
  const effectiveColumns = useMemo<Record<TableColumnKey, boolean>>(() => {
    const effective = { ...autoDetectedColumns };
    for (const [key, override] of Object.entries(columnOverrides)) {
      if (override !== undefined) {
        effective[key as TableColumnKey] = override;
      }
    }
    return effective;
  }, [autoDetectedColumns, columnOverrides]);

  const visibleColumnCount = useMemo(
    () => Object.values(effectiveColumns).filter(Boolean).length,
    [effectiveColumns],
  );

  // Filter connections for the Pinout Table based on selection & power filter
  const filteredConnections = useMemo(() => {
    if (!circuit) return [];
    let conns = circuit.connections;

    if (hidePowerGnd) {
      conns = conns.filter((c) => {
        const signal = resolveConnectionSignal(c, circuit);
        return signal !== "power" && signal !== "ground";
      });
    }

    if (selectedComponentId) {
      conns = conns.filter(
        (c) =>
          c.from.componentId === selectedComponentId || c.to.componentId === selectedComponentId,
      );
    }

    return conns;
  }, [circuit, selectedComponentId, hidePowerGnd]);

  const handleCopyJson = useCallback(async () => {
    try {
      await writeTextToClipboard(code, "Circuit JSON");
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      // Handled
    }
  }, [code]);

  // If JSON parsing failed, display standard fallback with error banner
  if (parseError || !circuit) {
    return (
      <div
        className={cn(
          "flex w-full flex-col overflow-hidden rounded-xl border border-destructive/40 bg-card p-4 shadow-xs",
          className,
        )}
        data-wiring-viewer="error"
      >
        <div className="flex items-center gap-2 text-destructive text-sm font-semibold mb-2">
          <AlertTriangle className="size-4" />
          <span>Failed to parse wiring JSON specification</span>
        </div>
        <p className="text-xs text-muted-foreground font-mono mb-3">{parseError}</p>
        <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 font-mono text-xs text-foreground leading-relaxed">
          {code}
        </pre>
      </div>
    );
  }

  const warnings = circuit.warnings ?? [];
  const selectedComponentName = selectedComponentId
    ? boards.find((b) => b.id === selectedComponentId)?.name ||
      peripherals.find((p) => p.id === selectedComponentId)?.name ||
      selectedComponentId
    : null;
  const title = circuit.title || fenceTitle || "Circuit Wiring Diagram";

  const renderEndpointCell = (name: string, pin: string, visual: SignalVisual) => (
    <TableCell className="font-mono">
      <div className="flex flex-col items-start gap-1">
        <span
          className="max-w-[160px] truncate text-[11px] leading-none text-muted-foreground"
          title={name}
        >
          {name}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold leading-none",
            visual.text,
            visual.bg,
            visual.border,
          )}
          title={pin}
        >
          {pin}
        </span>
      </div>
    </TableCell>
  );

  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card text-card-foreground shadow-xs",
        className,
      )}
      data-wiring-viewer="true"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 border-b border-border/60 bg-muted/30 p-3.5 select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Cpu className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
            {circuit.description ? (
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-1">
                {circuit.description}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground leading-snug">
                {boards.length} board{boards.length === 1 ? "" : "s"} · {peripherals.length}{" "}
                peripheral{peripherals.length === 1 ? "" : "s"} · {circuit.connections.length} wire
                {circuit.connections.length === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Copy Circuit JSON Button */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={handleCopyJson}
                  aria-label="Copy circuit JSON"
                >
                  {copiedJson ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              }
            />
            <TooltipPopup side="top">
              {copiedJson ? "Copied JSON!" : "Copy Circuit JSON"}
            </TooltipPopup>
          </Tooltip>
          {/* Warnings Compact Menu */}
          {warnings.length > 0 && (
            <Menu>
              <MenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-7 sm:size-6 text-warning bg-warning/10 border-warning/30 hover:bg-warning/20 hover:text-warning cursor-pointer"
                    aria-label="View Advisories"
                  >
                    <AlertTriangle className="size-3.5" />
                  </Button>
                }
              />
              <MenuPopup align="end" className="w-80 max-h-[300px] overflow-y-auto p-2">
                <div className="text-xs font-semibold mb-2">
                  Wiring Advisories ({warnings.length})
                </div>
                <div className="flex flex-col gap-2">
                  {warnings.map((w) => {
                    const formatted = formatCircuitWarning(w);
                    const warningKey = `warning-${formatted.message}-${formatted.affectedComponents?.join("-") ?? "global"}`;
                    return (
                      <div
                        key={warningKey}
                        className="flex items-start gap-2 text-xs p-1.5 bg-muted/30 rounded"
                      >
                        <AlertTriangle className="size-3 shrink-0 mt-0.5 text-warning" />
                        <span className="leading-tight">{formatted.message}</span>
                      </div>
                    );
                  })}
                </div>
              </MenuPopup>
            </Menu>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2 select-none">
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Component Focus Dropdown */}
          <Menu>
            <MenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-6.5 gap-1.5 px-2.5 text-[11px] font-medium cursor-pointer transition-colors max-w-[150px] sm:max-w-[220px]",
                    selectedComponentId
                      ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {selectedComponentId === null ? (
                    <Sparkles className="size-3 shrink-0" />
                  ) : (
                    <Cpu className="size-3 shrink-0" />
                  )}
                  <span className="truncate">
                    {selectedComponentId === null
                      ? "All Components"
                      : (selectedComponentName ?? "Component")}
                  </span>
                </Button>
              }
            />
            <MenuPopup align="start" className="w-56 max-h-[300px] overflow-y-auto">
              <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Focus
              </div>
              <MenuRadioGroup
                value={selectedComponentId ?? "all"}
                onValueChange={(val) => setSelectedComponentId(val === "all" ? null : val)}
              >
                <MenuRadioItem value="all">All Components</MenuRadioItem>

                {boards.length > 0 && <MenuSeparator />}
                {boards.map((b) => (
                  <MenuRadioItem key={b.id} value={b.id} className="truncate">
                    {b.name}
                  </MenuRadioItem>
                ))}

                {peripherals.length > 0 && <MenuSeparator />}
                {peripherals.map((p) => (
                  <MenuRadioItem key={p.id} value={p.id} className="truncate">
                    {p.name}
                  </MenuRadioItem>
                ))}
              </MenuRadioGroup>
            </MenuPopup>
          </Menu>

          {/* Hide Power/GND Rails Toggle */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-6.5 gap-1.5 px-2.5 text-[11px] font-medium cursor-pointer transition-colors",
                    hidePowerGnd
                      ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setHidePowerGnd((prev) => !prev)}
                >
                  {hidePowerGnd ? (
                    <EyeOff className="size-3 shrink-0" />
                  ) : (
                    <Eye className="size-3 shrink-0" />
                  )}
                  <span className="hidden sm:inline">Power/GND</span>
                </Button>
              }
            />
            <TooltipPopup side="top">
              {hidePowerGnd ? "Show power & ground wires" : "Hide power & ground wires"}
            </TooltipPopup>
          </Tooltip>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Filtered wire count */}
          <span className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
            {filteredConnections.length} wire{filteredConnections.length === 1 ? "" : "s"}
          </span>

          {/* Appearance / Style Menu */}
          <Menu>
            <MenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6.5 gap-1.5 px-2.5 text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                >
                  <Palette className="size-3 shrink-0" />
                  <span className="hidden sm:inline">Style</span>
                </Button>
              }
            />
            <MenuPopup align="end" className="w-60">
              <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Net Colors
              </div>
              <MenuRadioGroup
                value={netColorMode}
                onValueChange={(val) => setNetColorMode(val as NetColorMode)}
              >
                {NET_COLOR_MODE_OPTIONS.map((option) => (
                  <MenuRadioItem key={option.value} value={option.value}>
                    <div className="flex flex-col gap-0.5 w-full py-0.5">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5 shrink-0">
                          {option.preview.map((dot) => (
                            <span key={dot} className={cn("size-1.5 rounded-full", dot)} />
                          ))}
                        </span>
                        <span className="text-xs font-medium">{option.label}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground leading-none">
                        {option.hint}
                      </span>
                    </div>
                  </MenuRadioItem>
                ))}
              </MenuRadioGroup>
              <MenuSeparator />
              <MenuCheckboxItem
                checked={suggestWireColors}
                onCheckedChange={(checked) => setSuggestWireColors(checked === true)}
              >
                <div className="flex flex-col gap-0.5 w-full py-0.5">
                  <span className="text-xs font-medium">Suggest wire colors</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    Pick a jumper color from the signal type when the circuit doesn't specify one
                  </span>
                </div>
              </MenuCheckboxItem>
            </MenuPopup>
          </Menu>

          {/* Column Visibility Menu */}
          <Menu>
            <MenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6.5 gap-1.5 px-2.5 text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                >
                  <SlidersHorizontal className="size-3 shrink-0" />
                  <span className="hidden sm:inline">
                    Columns ({visibleColumnCount}/{TABLE_COLUMNS.length})
                  </span>
                  <span className="sm:hidden">{visibleColumnCount}</span>
                </Button>
              }
            />
            <MenuPopup align="end" className="w-48">
              <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                Toggle Columns
              </div>
              {TABLE_COLUMNS.map((col) => {
                const isChecked = effectiveColumns[col.key];
                const isAutoEmpty = !autoDetectedColumns[col.key];
                return (
                  <MenuCheckboxItem
                    key={col.key}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      setColumnOverride(col.key, checked);
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{col.label}</span>
                      {isAutoEmpty && (
                        <span className="text-[10px] text-muted-foreground font-mono">(empty)</span>
                      )}
                    </div>
                  </MenuCheckboxItem>
                );
              })}
            </MenuPopup>
          </Menu>
        </div>
      </div>

      {/* Connection Table */}
      <div className="p-3 max-h-[500px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              {effectiveColumns.from && (
                <TableHead className="w-[170px] text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  From
                </TableHead>
              )}
              {effectiveColumns.wireColor && (
                <TableHead className="w-[100px] text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Wire
                </TableHead>
              )}
              {effectiveColumns.signal && (
                <TableHead className="w-[110px] text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Signal
                </TableHead>
              )}
              {effectiveColumns.to && (
                <TableHead className="w-[170px] text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  To
                </TableHead>
              )}
              {effectiveColumns.voltage && (
                <TableHead className="w-[80px] text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Voltage
                </TableHead>
              )}
              {effectiveColumns.notes && (
                <TableHead className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Notes
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConnections.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnCount}
                  className="text-center py-6 text-xs text-muted-foreground"
                >
                  No connections match the current filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredConnections.map((conn, idx) => {
                const signal = resolveConnectionSignal(conn, circuit);
                const visual = getSignalVisual(signal, netColorMode);
                const wireColorName =
                  conn.wireColor?.trim() ||
                  (suggestWireColors ? deriveWireColorName(conn, signal) : undefined);
                const wireHex = wireColorName
                  ? (WIRE_COLOR_MAP[wireColorName.toLowerCase()] ?? WIRE_COLOR_FALLBACK)
                  : undefined;
                const rowKey = `${conn.from.componentId}:${conn.from.pin}->${conn.to.componentId}:${conn.to.pin}-${conn.signal ?? conn.signalType ?? ""}-${idx}`;

                const fromComp =
                  boards.find((b) => b.id === conn.from.componentId) ||
                  peripherals.find((p) => p.id === conn.from.componentId);
                const toComp =
                  boards.find((b) => b.id === conn.to.componentId) ||
                  peripherals.find((p) => p.id === conn.to.componentId);

                // If the user is focusing on a component, and that component is the TARGET of this connection,
                // we swap the left/right display so the focused component is always on the left ("From").
                const isReversed = selectedComponentId === conn.to.componentId;

                const displayFromComp = isReversed ? toComp : fromComp;
                const displayToComp = isReversed ? fromComp : toComp;
                const displayFromName =
                  displayFromComp?.name ??
                  (isReversed ? conn.to.componentId : conn.from.componentId);
                const displayToName =
                  displayToComp?.name ?? (isReversed ? conn.from.componentId : conn.to.componentId);
                const displayFromPin = isReversed ? conn.to.pin : conn.from.pin;
                const displayToPin = isReversed ? conn.from.pin : conn.to.pin;

                return (
                  <TableRow key={rowKey} className="border-b border-border/30 hover:bg-muted/30">
                    {effectiveColumns.from &&
                      renderEndpointCell(displayFromName, displayFromPin, visual)}
                    {effectiveColumns.wireColor && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {wireHex && (
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <span
                                    className="h-1.5 w-7 rounded-full ring-1 ring-inset ring-black/15 dark:ring-white/25 shrink-0"
                                    style={{ backgroundColor: wireHex }}
                                  />
                                }
                              />
                              <TooltipPopup side="top">
                                {conn.wireColor?.trim()
                                  ? "Specified wire color"
                                  : "Suggested from signal type"}
                              </TooltipPopup>
                            </Tooltip>
                          )}
                          <span className="text-[11px] capitalize text-muted-foreground">
                            {wireColorName ?? "—"}
                          </span>
                        </div>
                      </TableCell>
                    )}
                    {effectiveColumns.signal && (
                      <TableCell>
                        <span
                          className={cn(
                            "font-mono text-[11px] font-semibold",
                            netColorMode === "neutral" ? "text-foreground" : visual.text,
                          )}
                          title={conn.notes || conn.signal || conn.signalType || undefined}
                        >
                          {conn.signal || conn.signalType || "—"}
                        </span>
                      </TableCell>
                    )}
                    {effectiveColumns.to && renderEndpointCell(displayToName, displayToPin, visual)}
                    {effectiveColumns.voltage && (
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {conn.voltage || "—"}
                      </TableCell>
                    )}
                    {effectiveColumns.notes && (
                      <TableCell className="max-w-[220px]">
                        <span
                          className="text-[11px] text-muted-foreground line-clamp-2"
                          title={conn.notes || undefined}
                        >
                          {conn.notes || "—"}
                        </span>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
