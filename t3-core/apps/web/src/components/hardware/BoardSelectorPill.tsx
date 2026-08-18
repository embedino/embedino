import { Popover } from "@base-ui/react/popover";
import { useAtomValue } from "@effect/atom-react";
import { ChevronDownIcon, CpuIcon } from "lucide-react";
import { memo, useState } from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  hardwareStateAtom,
  getConnectedDeviceCount,
  useHardwareSubscription,
} from "~/state/hardware";
import { usePrimaryEnvironmentId } from "~/state/environments";
import { Dialog } from "~/components/ui/dialog";
import { ToolchainSetupDialog } from "~/components/wiring/ToolchainSetup";
import { BoardSelectorPopover } from "./BoardSelectorPopover";
import { BoardNamingDialog } from "./BoardNamingDialog";

import type { HardwareDevice, EnvironmentId } from "@t3tools/contracts";
import type { ActiveToolchain } from "~/state/toolchain";

export type HardwareAction = "flash" | "monitor";

export const BoardSelectorPill = memo(function BoardSelectorPill({
  environmentId,
  onRunHardwareAction,
}: {
  environmentId: EnvironmentId | null;
  onRunHardwareAction: (
    action: HardwareAction,
    device: HardwareDevice,
    toolchain: NonNullable<ActiveToolchain>,
  ) => void;
}) {
  // Use the primary environment as a fallback so hardware polling starts
  // immediately on app load, even before a project or thread is selected.
  const primaryEnvironmentId = usePrimaryEnvironmentId();
  const effectiveEnvironmentId = environmentId ?? primaryEnvironmentId;

  useHardwareSubscription(effectiveEnvironmentId);
  const state = useAtomValue(hardwareStateAtom);
  const [open, setOpen] = useState(false);
  const [namingDevice, setNamingDevice] = useState<HardwareDevice | null>(null);
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
        <Popover.Trigger render={<Button size="xs" variant="outline" className="ps-[8.5px]" />}>
          <CpuIcon aria-hidden="true" className="size-3.5 text-foreground opacity-100" />
          <span className="sr-only @3xl/header-actions:not-sr-only @3xl/header-actions:ml-0.5 truncate max-w-[150px]">
            {displayText}
          </span>
          <ChevronDownIcon
            className={cn("size-3 opacity-50", deviceCount >= 2 ? "ml-1" : "hidden")}
          />
        </Popover.Trigger>
        {open && (
          <BoardSelectorPopover
            onClose={() => setOpen(false)}
            onRunHardwareAction={onRunHardwareAction}
            onNamingDevice={(device) => {
              setOpen(false);
              setNamingDevice(device);
            }}
          />
        )}
      </Popover.Root>
      <ToolchainSetupDialog />
      <BoardNamingDialog device={namingDevice} onClose={() => setNamingDevice(null)} />
    </Dialog>
  );
});
