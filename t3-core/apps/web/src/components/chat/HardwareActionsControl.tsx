import { memo, useCallback, useState } from "react";
import { ChevronDownIcon, DownloadIcon, MonitorIcon } from "lucide-react";
import { useAtomValue } from "@effect/atom-react";
import { Button } from "../ui/button";
import { Group, GroupSeparator } from "../ui/group";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "../ui/menu";
import { toastManager } from "../ui/toast";
import { useActiveToolchain, type ActiveToolchain } from "../../state/toolchain";
import { hardwareStateAtom } from "../../state/hardware";
import type { HardwareDevice } from "@t3tools/contracts";
import { cn } from "~/lib/utils";

export type HardwareAction = "flash" | "monitor";

export const HardwareActionsControl = memo(function HardwareActionsControl({
  compact = false,
  onRunHardwareAction,
}: {
  compact?: boolean;
  onRunHardwareAction: (
    action: HardwareAction,
    device: HardwareDevice,
    toolchain: NonNullable<ActiveToolchain>,
  ) => void;
}) {
  const [preferredAction, setPreferredAction] = useState<HardwareAction>("flash");
  const hardwareState = useAtomValue(hardwareStateAtom);
  const [activeToolchain] = useActiveToolchain();

  const runAction = useCallback(
    (action: HardwareAction) => {
      setPreferredAction(action);

      if (!hardwareState.activeDeviceId) {
        toastManager.add({
          title: "No board selected",
          description: "Please select a board from the toolbar before running hardware actions.",
        });
        return;
      }

      const activeDevice = hardwareState.connectedDevices.find(
        (d: HardwareDevice) => d.id === hardwareState.activeDeviceId,
      );
      if (!activeDevice) return;

      if (!activeToolchain) {
        toastManager.add({
          title: "No toolchain selected",
          description: "Please configure your active build toolchain in settings.",
        });
        return;
      }

      onRunHardwareAction(action, activeDevice, activeToolchain);
    },
    [
      hardwareState.activeDeviceId,
      hardwareState.connectedDevices,
      activeToolchain,
      onRunHardwareAction,
    ],
  );

  const PrimaryIcon = preferredAction === "flash" ? DownloadIcon : MonitorIcon;
  const primaryLabel = preferredAction === "flash" ? "Flash" : "Serial Monitor";

  return (
    <Group aria-label="Hardware Actions">
      <Button
        aria-label={compact ? `Run ${primaryLabel}` : undefined}
        className="ps-[8.5px]"
        size="xs"
        variant="outline"
        onClick={() => runAction(preferredAction)}
      >
        <PrimaryIcon aria-hidden="true" className="size-3.5 text-foreground opacity-100" />
        <span
          className={
            compact
              ? "sr-only"
              : "sr-only @3xl/header-actions:not-sr-only @3xl/header-actions:ml-0.5"
          }
        >
          {primaryLabel}
        </span>
      </Button>
      <GroupSeparator {...(!compact ? { className: "hidden @3xl/header-actions:block" } : {})} />
      <Menu>
        <MenuTrigger
          render={
            <Button
              aria-label={compact ? "Choose action" : "Hardware options"}
              size="icon-xs"
              variant="outline"
            />
          }
        >
          <ChevronDownIcon aria-hidden="true" className="size-4" />
        </MenuTrigger>
        <MenuPopup align="end">
          <MenuItem onClick={() => runAction("flash")}>
            <DownloadIcon
              aria-hidden="true"
              className={cn(
                preferredAction === "flash"
                  ? "text-foreground opacity-100"
                  : "text-muted-foreground",
              )}
            />
            Flash
          </MenuItem>
          <MenuItem onClick={() => runAction("monitor")}>
            <MonitorIcon
              aria-hidden="true"
              className={cn(
                preferredAction === "monitor"
                  ? "text-foreground opacity-100"
                  : "text-muted-foreground",
              )}
            />
            Serial Monitor
          </MenuItem>
        </MenuPopup>
      </Menu>
    </Group>
  );
});
