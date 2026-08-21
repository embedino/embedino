import React, { useMemo, useCallback } from "react";
import { ArrowUpRight, Cpu, ShieldAlert, AlertTriangle } from "lucide-react";
import type { ScopedThreadRef } from "@embedino/contracts";
import {
  parseCircuitWiringJson,
  getCircuitBoards,
  getCircuitPeripherals,
} from "@embedino/contracts";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useRightPanelStore } from "~/rightPanelStore";
import { useWiringStore } from "~/state/wiring";

export interface WiringLaunchCardProps {
  code: string;
  fenceTitle?: string | undefined;
  threadRef?: ScopedThreadRef | undefined;
  className?: string | undefined;
}

export function WiringLaunchCard({
  code,
  fenceTitle,
  threadRef,
  className,
}: WiringLaunchCardProps) {
  // Parse circuit JSON
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

  const handleOpenWiring = useCallback(() => {
    useWiringStore.getState().setCircuit(threadRef, code, fenceTitle);
    if (threadRef) {
      useRightPanelStore.getState().open(threadRef, "wiring");
    }
  }, [threadRef, code, fenceTitle]);

  if (parseError || !circuit) {
    return (
      <div
        className={cn(
          "flex w-full flex-col gap-2 overflow-hidden rounded-xl border border-destructive/40 bg-card p-3.5 shadow-xs",
          className,
        )}
        data-wiring-launch-card="error"
      >
        <div className="flex items-center gap-2 text-destructive text-xs font-semibold">
          <AlertTriangle className="size-3.5 shrink-0" />
          <span>Invalid wiring specification</span>
        </div>
        <p className="text-[11px] text-muted-foreground font-mono truncate">{parseError}</p>
      </div>
    );
  }

  const warnings = circuit.warnings ?? [];
  const title = circuit.title || fenceTitle || "Circuit Wiring Diagram";

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border border-border/80 bg-card text-card-foreground p-4 shadow-xs hover:border-border transition-colors select-none",
        className,
      )}
      data-wiring-launch-card="true"
    >
      {/* Top Header & Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Cpu className="size-4" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-medium text-foreground">{title}</h4>
          </div>
        </div>

        {/* Action Button */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1.5 font-medium cursor-pointer self-start sm:self-auto shrink-0"
          onClick={handleOpenWiring}
        >
          <span>Open Wiring</span>
          <ArrowUpRight className="size-3.5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
