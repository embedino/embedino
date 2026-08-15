import { Popover } from "@base-ui/react/popover";
import { useAtomValue } from "@effect/atom-react";
import { ChevronDownIcon } from "lucide-react";
import { memo, useState } from "react";

import { selectTriggerVariants } from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { hardwareStateAtom, getConnectedDeviceCount } from "~/state/hardware";
import { Dialog } from "~/components/ui/dialog";
import { ToolchainSetupDialog } from "~/components/wiring/ToolchainSetup";
import { BoardSelectorPopover } from "./BoardSelectorPopover";

export const BoardSelectorPill = memo(function BoardSelectorPill() {
  const state = useAtomValue(hardwareStateAtom);
  const [open, setOpen] = useState(false);
  const deviceCount = getConnectedDeviceCount(state);

  // Compute display text
  let displayText = "No Board";
  if (state.targetBoardName) {
    if (state.isOnline && state.targetPortDisplay) {
      displayText = `${state.targetBoardName} (${state.targetPortDisplay})`;
    } else if (!state.isOnline) {
      displayText = "No Board";
    } else {
      displayText = state.targetBoardName;
    }
  } else if (state.activeDeviceId) {
    // Generic bridge — no resolved board name
    const activeDevice = state.connectedDevices.find((d) => d.id === state.activeDeviceId);
    if (activeDevice) {
      const label = activeDevice.driverChip ? `USB Serial` : "USB Serial";
      displayText =
        state.isOnline && activeDevice.portDisplayName
          ? `${label} (${activeDevice.portDisplayName})`
          : "No Board";
    }
  }

  return (
    <Dialog>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          render={<button type="button" data-composer-context-control />}
          className={cn(
            selectTriggerVariants({ variant: "ghost", size: "xs" }),
            "min-w-0 max-w-full font-medium",
          )}
        >
          <span
            data-composer-label
            className="min-w-0 max-w-[240px] group-data-[compact]/composer-context:max-w-0"
          >
            <span
              data-composer-label-motion
              className="block w-full min-w-0 max-w-[240px] origin-left truncate transition-[opacity,transform] duration-180 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[compact]/composer-context:[transform:translateX(-0.25rem)_scaleX(0.95)] group-data-[compact]/composer-context:opacity-0 motion-reduce:transform-none motion-reduce:transition-opacity"
            >
              {displayText}
            </span>
          </span>
          {deviceCount >= 2 && <ChevronDownIcon className="-me-1 size-3 opacity-50" />}
        </Popover.Trigger>
        {open && <BoardSelectorPopover onClose={() => setOpen(false)} />}
      </Popover.Root>
      <ToolchainSetupDialog />
    </Dialog>
  );
});
