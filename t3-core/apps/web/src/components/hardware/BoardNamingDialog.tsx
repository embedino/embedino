import * as React from "react";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBackdrop,
  DialogPanel,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { HardwareDevice } from "@t3tools/contracts";
import { usePrimaryEnvironmentId } from "~/state/environments";
import { useHardwareSetDeviceAssociation, updateHardwareState } from "~/state/hardware";

interface BoardNamingDialogProps {
  device: HardwareDevice | null;
  onClose: () => void;
}

export function BoardNamingDialog({ device, onClose }: BoardNamingDialogProps) {
  const environmentId = usePrimaryEnvironmentId();
  const setDeviceAssociation = useHardwareSetDeviceAssociation();
  const [boardName, setBoardName] = React.useState("");

  // Pre-fill input if there's a guessed name
  React.useEffect(() => {
    if (device) {
      setBoardName(device.boardName ?? device.driverChip ?? "");
    }
  }, [device]);

  const handleSave = () => {
    if (!device || !boardName.trim()) return;

    const finalName = boardName.trim();
    if (environmentId) {
      setDeviceAssociation({
        environmentId,
        payload: { deviceId: device.id, boardName: finalName },
      }).catch(() => {});
    }
    updateHardwareState({
      activeDeviceId: device.id,
      targetBoardName: finalName,
      targetPortDisplay: device.portDisplayName,
      isOnline: true,
    });
    onClose();
  };

  return (
    <Dialog open={!!device} onOpenChange={(open) => !open && onClose()}>
      <DialogBackdrop />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Identify Your Board</DialogTitle>
          <DialogDescription>
            The system detected {device?.boardName ? `a "${device.boardName}"` : "a generic chip"}{" "}
            via USB connection. To ensure the AI generates the correct code, pin wiring, and memory
            configurations, it needs the exact board model. Please look at your physical board and
            type the full name printed on it.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <div className="flex flex-col gap-4">
            <Input
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="e.g. ESP32-S3-WROOM-1-N16R8"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
              autoFocus
            />
          </div>
        </DialogPanel>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!boardName.trim()}>
            Save & Connect
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
