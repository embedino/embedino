import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import { useAtomValue } from "@effect/atom-react";
import {
  CheckIcon,
  CircleIcon,
  ZapIcon,
  Loader2,
  DownloadIcon,
  MonitorIcon,
  PencilIcon,
  XIcon,
} from "lucide-react";
import {
  hardwareStateAtom,
  updateHardwareState,
  useHardwareSetDeviceAssociation,
} from "~/state/hardware";
import { DialogTrigger } from "~/components/ui/dialog";
import { toastManager } from "~/components/ui/toast";
import { useActiveToolchain, type ActiveToolchain } from "~/state/toolchain";
import { usePrimaryEnvironmentId } from "~/state/environments";
import type { HardwareDevice } from "@t3tools/contracts";
import type { HardwareAction } from "./BoardSelectorPill";

const GENERIC_KEYWORDS = new Set(["esp32", "esp32s2", "esp32s3", "esp32c3", "esp8266", "rp2040"]);

function isGenericBoard(boardName: string | null | undefined): boolean {
  if (!boardName) return true;
  const lower = boardName.toLowerCase();
  const normalized = lower.replace(/[^a-z0-9]/g, "");
  return GENERIC_KEYWORDS.has(normalized) || lower.includes("generic") || lower.includes("unknown");
}

export function BoardSelectorPopover({
  onClose,
  onRunHardwareAction,
  onNamingDevice,
}: {
  onClose: () => void;
  onRunHardwareAction: (
    action: HardwareAction,
    device: HardwareDevice,
    toolchain: NonNullable<ActiveToolchain>,
  ) => void;
  onNamingDevice: (device: HardwareDevice) => void;
}) {
  const state = useAtomValue(hardwareStateAtom);
  const [activeToolchain] = useActiveToolchain();
  const environmentId = usePrimaryEnvironmentId();
  const setDeviceAssociation = useHardwareSetDeviceAssociation();

  const [editingDeviceId, setEditingDeviceId] = React.useState<string | null>(null);
  const [editBoardName, setEditBoardName] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editingDeviceId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingDeviceId]);

  const handleAction = (action: HardwareAction) => {
    if (!state.activeDeviceId) {
      toastManager.add({
        title: "No board selected",
        description: "Please select a board before running hardware actions.",
      });
      return;
    }

    const activeDevice = state.connectedDevices.find(
      (d: HardwareDevice) => d.id === state.activeDeviceId,
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
    onClose();
  };

  return (
    <Popover.Portal>
      <Popover.Positioner
        align="start"
        side="bottom"
        sideOffset={4}
        className="z-[130] outline-none select-none"
      >
        <Popover.Popup className="dropdown-glass w-64 max-h-[28rem] rounded-lg text-foreground outline-none overflow-hidden origin-(--transform-origin) shadow-lg">
          <div className="bg-transparent h-full flex flex-col">
            {/* ── Connected Hardware Section ── */}
            <div className="px-3 pt-3 pb-1">
              <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">
                CONNECTED BOARDS
              </span>
            </div>

            <div className="flex flex-col px-1 pb-1">
              {state.connectedDevices.length > 0 ? (
                state.connectedDevices.map((device: HardwareDevice) => {
                  const isActive = device.id === state.activeDeviceId;
                  const isEditing = device.id === editingDeviceId;
                  const label = device.boardName
                    ? `${device.boardName} · ${device.portDisplayName}`
                    : `USB Serial${device.driverChip ? ` (${device.driverChip})` : ""} · ${device.portDisplayName}`;
                  const isGeneric = isGenericBoard(device.boardName);

                  if (isEditing) {
                    return (
                      <div
                        key={device.id}
                        className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm bg-foreground/[0.08]"
                      >
                        <input
                          ref={inputRef}
                          className="flex-1 bg-transparent outline-none border-b border-border/50 focus:border-primary text-sm min-w-0"
                          value={editBoardName}
                          onChange={(e) => setEditBoardName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && editBoardName.trim()) {
                              if (environmentId) {
                                setDeviceAssociation({
                                  environmentId,
                                  payload: { deviceId: device.id, boardName: editBoardName.trim() },
                                }).catch(() => {});
                              }
                              updateHardwareState({
                                activeDeviceId: device.id,
                                targetBoardName: editBoardName.trim(),
                                targetPortDisplay: device.portDisplayName,
                                isOnline: true,
                              });
                              setEditingDeviceId(null);
                            } else if (e.key === "Escape") {
                              setEditingDeviceId(null);
                            }
                          }}
                          placeholder="e.g. ESP32-S3-WROOM-1"
                        />
                        <button
                          className="text-muted-foreground hover:text-foreground cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (editBoardName.trim()) {
                              if (environmentId) {
                                setDeviceAssociation({
                                  environmentId,
                                  payload: { deviceId: device.id, boardName: editBoardName.trim() },
                                }).catch(() => {});
                              }
                              updateHardwareState({
                                activeDeviceId: device.id,
                                targetBoardName: editBoardName.trim(),
                                targetPortDisplay: device.portDisplayName,
                                isOnline: true,
                              });
                              setEditingDeviceId(null);
                            }
                          }}
                        >
                          <CheckIcon className="size-4" />
                        </button>
                        <button
                          className="text-muted-foreground hover:text-destructive cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDeviceId(null);
                          }}
                        >
                          <XIcon className="size-4" />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={device.id}
                      className="group flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-foreground/[0.08]"
                    >
                      <button
                        type="button"
                        className="flex flex-1 items-center gap-2 text-left cursor-pointer outline-none min-w-0"
                        onClick={() => {
                          if (isGeneric) {
                            onNamingDevice(device);
                          } else {
                            updateHardwareState({
                              activeDeviceId: device.id,
                              targetBoardName:
                                device.boardName ?? device.driverChip ?? "Generic USB",
                              targetPortDisplay: device.portDisplayName,
                              isOnline: true,
                            });
                          }
                        }}
                      >
                        {isActive ? (
                          <CheckIcon className="size-4 shrink-0 text-foreground" />
                        ) : (
                          <CircleIcon className="size-4 shrink-0 opacity-20" />
                        )}
                        <span className="flex-1 truncate">{label}</span>
                        {isActive ? (
                          <span className="text-xs text-muted-foreground ml-auto group-hover:hidden pr-1">
                            Active
                          </span>
                        ) : device.status === "enriching" ? (
                          <div className="flex items-center text-xs text-muted-foreground/70 ml-auto gap-1 group-hover:hidden pr-1">
                            <Loader2 className="size-3 animate-spin" />
                            Identifying...
                          </div>
                        ) : device.status === "generic" ? (
                          <span className="text-xs text-muted-foreground/70 ml-auto group-hover:hidden pr-1">
                            Set Board →
                          </span>
                        ) : null}
                      </button>

                      <button
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground cursor-pointer transition-opacity ml-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditBoardName(device.boardName ?? device.driverChip ?? "");
                          setEditingDeviceId(device.id);
                        }}
                        title="Edit Board Name"
                      >
                        <PencilIcon className="size-3.5" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">No connected devices</div>
              )}
            </div>

            {/* ── Hardware Actions Section ── */}
            {state.activeDeviceId && state.isOnline && (
              <>
                <div className="mx-2 border-t border-border/50" />
                <div className="px-3 pt-2 pb-1">
                  <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">
                    ACTIONS
                  </span>
                </div>
                <div className="flex flex-col px-1 pb-1">
                  <button
                    type="button"
                    onClick={() => handleAction("flash")}
                    className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm text-left cursor-pointer transition-colors hover:bg-foreground/[0.08] active:bg-foreground/[0.12]"
                  >
                    <DownloadIcon className="size-4 shrink-0 text-foreground" />
                    <span className="flex-1 truncate">Flash to Board</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction("monitor")}
                    className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm text-left cursor-pointer transition-colors hover:bg-foreground/[0.08] active:bg-foreground/[0.12]"
                  >
                    <MonitorIcon className="size-4 shrink-0 text-foreground" />
                    <span className="flex-1 truncate">Serial Monitor</span>
                  </button>
                </div>
              </>
            )}

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
