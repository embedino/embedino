import React, { useMemo, useState, useCallback } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Cpu,
  Info,
  Layers,
  OctagonAlert,
  SlidersHorizontal,
  Sparkles,
  Table as TableIcon,
  X,
} from "lucide-react";
import {
  parseCircuitWiringJson,
  getCircuitBoards,
  getCircuitPeripherals,
  formatCircuitWarning,
} from "@t3tools/contracts";
import { TABLE_COLUMNS, WIRE_COLOR_MAP, type TableColumnKey } from "./wiringTypes";
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

export interface InteractiveWiringViewerProps {
  code: string;
  fenceTitle?: string | undefined;
  className?: string | undefined;
  selectedComponentId?: string | null | undefined;
  onSelectComponentId?: ((id: string | null) => void) | undefined;
  columnOverrides?: Record<string, boolean> | undefined;
  onColumnOverrideChange?: ((columnKey: string, visible: boolean) => void) | undefined;
}

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
      conns = conns.filter((c) => c.signalType !== "power" && c.signalType !== "ground");
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

  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card text-card-foreground shadow-xs",
        className,
      )}
      data-wiring-viewer="true"
    >
      {/* Header Toolbar */}
      <div className="flex flex-col gap-2 border-b border-border/60 bg-muted/30 p-3.5 sm:flex-row sm:items-center sm:justify-between select-none">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <Cpu className="size-4 text-muted-foreground shrink-0" />
            <h3 className="text-sm font-semibold text-foreground truncate">
              {circuit.title || fenceTitle || "Circuit Wiring Diagram"}
            </h3>
          </div>
          {circuit.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {circuit.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
            <span className="font-medium text-foreground">{boards.length}</span> Board
            {boards.length === 1 ? "" : "s"}
            <span>•</span>
            <span className="font-medium text-foreground">{peripherals.length}</span> Peripheral
            {peripherals.length === 1 ? "" : "s"}
            <span>•</span>
            <span className="font-medium text-foreground">{circuit.connections.length}</span> Wire
            {circuit.connections.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
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

      {/* Main Tab Content */}
      <div className="w-full">
        {/* Unified Table Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/15 px-3 py-2 text-xs select-none">
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            {/* 1. Component Focus Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium hidden sm:inline-block">Focus:</span>
              <Menu>
                <MenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-6.5 gap-1.5 px-2.5 text-[11px] font-medium cursor-pointer transition-colors max-w-[180px] sm:max-w-[240px]",
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
                    Select Focus
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
            </div>

            {/* 2. Hide Power/GND Rails Checkbox */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={hidePowerGnd}
                onChange={(e) => setHidePowerGnd(e.target.checked)}
                className="rounded border-border size-3.5 accent-primary cursor-pointer"
              />
              <span>Hide Power/GND</span>
            </label>

            {/* Divider & Filtered Connection Count */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="h-3.5 w-px bg-border/60" />
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">{filteredConnections.length}</span>
                <span>Connection{filteredConnections.length === 1 ? "" : "s"}</span>
              </div>
            </div>
          </div>

          {/* Column Visibility Menu */}
          <Menu>
            <MenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6.5 gap-1.5 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                >
                  <SlidersHorizontal className="size-3 shrink-0" />
                  <span className="hidden sm:inline">
                    Columns ({visibleColumnCount}/{TABLE_COLUMNS.length})
                  </span>
                  <span className="sm:hidden">{visibleColumnCount} Col</span>
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

        {/* Table Body */}
        <div className="p-3 max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 hover:bg-transparent">
                {effectiveColumns.from && (
                  <TableHead className="w-[180px] text-xs font-semibold text-muted-foreground">
                    From (Source)
                  </TableHead>
                )}
                {effectiveColumns.wireColor && (
                  <TableHead className="w-[110px] text-xs font-semibold text-muted-foreground">
                    Wire Color
                  </TableHead>
                )}
                {effectiveColumns.signal && (
                  <TableHead className="w-[130px] text-xs font-semibold text-muted-foreground">
                    Signal / Bus
                  </TableHead>
                )}
                {effectiveColumns.to && (
                  <TableHead className="w-[180px] text-xs font-semibold text-muted-foreground">
                    To (Target)
                  </TableHead>
                )}
                {effectiveColumns.voltage && (
                  <TableHead className="w-[90px] text-xs font-semibold text-muted-foreground">
                    Voltage
                  </TableHead>
                )}
                {effectiveColumns.notes && (
                  <TableHead className="text-xs font-semibold text-muted-foreground">
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
                  const colorHex = conn.wireColor
                    ? WIRE_COLOR_MAP[conn.wireColor.toLowerCase()]
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
                    displayToComp?.name ??
                    (isReversed ? conn.from.componentId : conn.to.componentId);
                  const displayFromPin = isReversed ? conn.to.pin : conn.from.pin;
                  const displayToPin = isReversed ? conn.from.pin : conn.to.pin;

                  return (
                    <TableRow key={rowKey} className="border-b border-border/30 hover:bg-muted/30">
                      {effectiveColumns.from && (
                        <TableCell className="font-mono text-xs">
                          <span className="text-foreground">{displayFromName}</span>
                          <span className="text-muted-foreground mx-1">:</span>
                          <span className="text-primary font-medium">{displayFromPin}</span>
                        </TableCell>
                      )}
                      {effectiveColumns.wireColor && (
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {colorHex && (
                              <span
                                className="size-2.5 rounded-full ring-1 ring-border/50 shrink-0"
                                style={{ backgroundColor: colorHex }}
                              />
                            )}
                            <span className="capitalize text-xs text-foreground/90">
                              {conn.wireColor || "—"}
                            </span>
                          </div>
                        </TableCell>
                      )}
                      {effectiveColumns.signal && (
                        <TableCell>
                          <span className="rounded bg-muted/70 px-1.5 py-0.5 text-[11px] font-mono font-medium text-foreground">
                            {conn.signal || conn.signalType || "—"}
                          </span>
                        </TableCell>
                      )}
                      {effectiveColumns.to && (
                        <TableCell className="font-mono text-xs">
                          <span className="text-foreground">{displayToName}</span>
                          <span className="text-muted-foreground mx-1">:</span>
                          <span className="text-primary font-medium">{displayToPin}</span>
                        </TableCell>
                      )}
                      {effectiveColumns.voltage && (
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {conn.voltage || "—"}
                        </TableCell>
                      )}
                      {effectiveColumns.notes && (
                        <TableCell className="text-xs text-muted-foreground">
                          {conn.notes || "—"}
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
    </div>
  );
}
