import React, { useMemo, useCallback } from "react";
import { AlertTriangle, ArrowUpRight, Cpu } from "lucide-react";
import type { ScopedThreadRef } from "@embedino/contracts";
import {
  parseCircuitWiringJson,
  getCircuitBoards,
  getCircuitPeripherals,
} from "@embedino/contracts";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { cn } from "~/lib/utils";
import { useRightPanelStore } from "~/rightPanelStore";
import { useWiringStore } from "~/state/wiring";

export interface WiringLaunchCardProps {
  code: string;
  fenceTitle?: string | undefined;
  threadRef?: ScopedThreadRef | undefined;
  isStreaming?: boolean | undefined;
  className?: string | undefined;
}

export function WiringLaunchCard({
  code,
  fenceTitle,
  threadRef,
  isStreaming,
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
    // While the assistant is still writing the fence the JSON is necessarily
    // incomplete, so a parse failure here is expected progress — never surface
    // it as an error. Only a finished fence that still fails to parse is one.
    if (isStreaming) {
      return (
        <div
          className={cn(
            "!mt-4 !mb-3 flex w-full flex-col gap-2 overflow-hidden rounded-xl border border-border/60 bg-card p-4 shadow-xs",
            className,
          )}
          data-wiring-launch-card="generating"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-muted-foreground">
              <Spinner className="size-4" />
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-medium text-foreground">
                {fenceTitle || "Circuit Wiring Diagram"}
              </div>
              <div className="text-[11px] text-muted-foreground">Generating wiring…</div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div
        className={cn(
          "!mt-4 !mb-3 flex w-full flex-col gap-2 overflow-hidden rounded-xl border border-destructive/40 bg-card p-3.5 shadow-xs",
          className,
        )}
        data-wiring-launch-card="error"
      >
        <div className="flex items-center gap-2 text-destructive text-xs font-semibold">
          <AlertTriangle className="size-3.5 shrink-0" />
          <span>Invalid wiring specification</span>
        </div>
        <div className="truncate font-mono text-[11px] text-muted-foreground">{parseError}</div>
      </div>
    );
  }

  const title = circuit.title || fenceTitle || "Circuit Wiring Diagram";
  const summary = [
    boards.length > 0 ? `${boards.length} ${boards.length === 1 ? "board" : "boards"}` : null,
    peripherals.length > 0
      ? `${peripherals.length} ${peripherals.length === 1 ? "component" : "components"}`
      : null,
    `${circuit.connections.length} ${circuit.connections.length === 1 ? "connection" : "connections"}`,
  ]
    .filter((part): part is string => part !== null)
    .join(" · ");

  return (
    <div
      className={cn(
        "group/wiring-launch !mt-4 !mb-3 flex w-full items-center gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 text-card-foreground shadow-xs transition-colors hover:border-border hover:bg-muted/30 select-none",
        className,
      )}
      data-wiring-launch-card="true"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/40 text-muted-foreground transition-colors group-hover/wiring-launch:text-foreground">
          <Cpu className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground">{title}</div>
          {summary ? (
            <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{summary}</div>
          ) : null}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={`Open wiring for ${title}`}
        className="h-8 shrink-0 gap-1.5 border-border/70 bg-transparent px-3 text-xs font-medium hover:bg-muted/50"
        onClick={handleOpenWiring}
      >
        <span>Open wiring</span>
        <ArrowUpRight className="size-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
}
