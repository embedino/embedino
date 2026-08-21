import React, { useCallback } from "react";
import { Cpu } from "lucide-react";
import type { ScopedThreadRef } from "@embedino/contracts";
import { InteractiveWiringViewer } from "./InteractiveWiringViewer";
import { useWiringStore } from "~/state/wiring";

export interface WiringPanelProps {
  threadRef: ScopedThreadRef | undefined;
}

export function WiringPanel({ threadRef }: WiringPanelProps) {
  const threadState = useWiringStore((state) => state.getThreadState(threadRef));
  const setSelectedComponent = useWiringStore((state) => state.setSelectedComponent);
  const setColumnOverride = useWiringStore((state) => state.setColumnOverride);

  const handleSelectComponent = useCallback(
    (id: string | null) => {
      setSelectedComponent(threadRef, id);
    },
    [threadRef, setSelectedComponent],
  );

  const handleColumnOverrideChange = useCallback(
    (key: string, visible: boolean) => {
      setColumnOverride(threadRef, key, visible);
    },
    [threadRef, setColumnOverride],
  );

  if (!threadState.code || !threadState.circuit) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center select-none">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3">
          <Cpu className="size-7" />
        </div>
        <h4 className="text-sm font-semibold text-foreground mb-1">No Active Wiring Diagram</h4>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          Ask the AI assistant to design, connect, or explain a microcontroller circuit to explore
          interactive pinouts and diagrams here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto p-3">
      <InteractiveWiringViewer
        code={threadState.code}
        fenceTitle={threadState.fenceTitle}
        selectedComponentId={threadState.selectedComponentId}
        onSelectComponentId={handleSelectComponent}
        columnOverrides={threadState.columnOverrides}
        onColumnOverrideChange={handleColumnOverrideChange}
      />
    </div>
  );
}
