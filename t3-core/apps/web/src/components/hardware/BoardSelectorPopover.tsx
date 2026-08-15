import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import { useAtomValue } from "@effect/atom-react";
import { CheckIcon, CircleIcon, ZapIcon, Loader2 } from "lucide-react";
import { hardwareStateAtom, updateHardwareState } from "~/state/hardware";
import { DialogTrigger } from "~/components/ui/dialog";

export function BoardSelectorPopover({ onClose }: { onClose: () => void }) {
  const state = useAtomValue(hardwareStateAtom);

  return (
    <Popover.Portal>
      <Popover.Positioner
        align="start"
        side="bottom"
        sideOffset={4}
        className="z-[130] outline-none select-none"
      >
        <Popover.Popup className="dropdown-glass w-80 max-h-[28rem] rounded-lg text-foreground outline-none overflow-hidden origin-(--transform-origin) shadow-lg">
          <div className="bg-transparent h-full flex flex-col">
            {/* ── Connected Hardware Section ── */}
            <div className="px-3 pt-3 pb-1">
              <span className="text-xs font-medium text-muted-foreground tracking-wide">
                CONNECTED HARDWARE
              </span>
            </div>

            <div className="flex flex-col px-1 pb-1">
              {state.connectedDevices.length > 0 ? (
                state.connectedDevices.map((device) => {
                  const isActive = device.id === state.activeDeviceId;
                  const label = device.boardName
                    ? `${device.boardName} · ${device.portDisplayName}`
                    : `USB Serial${device.driverChip ? ` (${device.driverChip})` : ""} · ${device.portDisplayName}`;

                  return (
                    <button
                      key={device.id}
                      type="button"
                      className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm text-left cursor-pointer transition-colors hover:bg-foreground/[0.08] active:bg-foreground/[0.12]"
                      onClick={() => {
                        updateHardwareState({
                          activeDeviceId: device.id,
                          targetBoardName: device.boardName ?? device.driverChip ?? "Generic USB",
                          targetPortDisplay: device.portDisplayName,
                          isOnline: true,
                        });
                        onClose();
                      }}
                    >
                      {isActive ? (
                        <CheckIcon className="size-4 shrink-0 text-foreground" />
                      ) : (
                        <CircleIcon className="size-4 shrink-0 opacity-20" />
                      )}
                      <span className="flex-1 truncate">{label}</span>
                      {isActive ? (
                        <span className="text-xs text-muted-foreground ml-auto">Active</span>
                      ) : device.status === "enriching" ? (
                        <div className="flex items-center text-xs text-muted-foreground/70 ml-auto gap-1">
                          <Loader2 className="size-3 animate-spin" />
                          Identifying...
                        </div>
                      ) : device.status === "generic" ? (
                        <span className="text-xs text-muted-foreground/70 ml-auto">
                          Set Board →
                        </span>
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">No connected devices</div>
              )}
            </div>

            {/* ── Separator ── */}
            <div className="mx-2 border-t border-border/50" />

            {/* ── Footer with Toolchains trigger ── */}
            <div className="flex justify-end p-2">
              <DialogTrigger
                onClick={onClose}
                className="flex items-center gap-1.5 hover:text-foreground text-muted-foreground transition-colors p-1 cursor-pointer text-sm"
              >
                <ZapIcon className="size-3.5" />
                Toolchains
              </DialogTrigger>
            </div>
          </div>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  );
}
