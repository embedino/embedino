import { useEffect, useSyncExternalStore } from "react";

import {
  completeConfirmDialogClose,
  readConfirmDialogState,
  registerConfirmDialogHost,
  respondToConfirmDialog,
  subscribeConfirmDialog,
} from "../confirmDialog";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

type ConfirmationCopy = {
  readonly title: string;
  readonly description: string | null;
};

export function resolveConfirmDialogCopy(message: string): ConfirmationCopy {
  const normalizedMessage = message.trim();
  const lines = normalizedMessage.split("\n");
  const questionLineIndex = lines.findIndex((line) => line.trim().endsWith("?"));

  if (questionLineIndex >= 0) {
    const title = lines[questionLineIndex]!.trim();
    const description = lines
      .filter((_, index) => index !== questionLineIndex)
      .join("\n")
      .trim();
    return { title, description: description || null };
  }

  const questionMarkIndex = normalizedMessage.indexOf("?");
  if (questionMarkIndex >= 0) {
    return {
      title: normalizedMessage.slice(0, questionMarkIndex + 1).trim(),
      description: normalizedMessage.slice(questionMarkIndex + 1).trim() || null,
    };
  }

  return {
    title: "Confirm action",
    description: normalizedMessage || "This action requires your confirmation.",
  };
}

export function ConfirmDialogHost() {
  const state = useSyncExternalStore(
    subscribeConfirmDialog,
    readConfirmDialogState,
    readConfirmDialogState,
  );

  useEffect(() => registerConfirmDialogHost(), []);

  const copy = resolveConfirmDialogCopy(state.status === "idle" ? "" : state.message);
  const confirmVariant = state.status === "idle" ? "default" : state.variant;
  const isDestructive = confirmVariant === "destructive";
  const onCancel = () => respondToConfirmDialog(false);
  const onConfirm = () => respondToConfirmDialog(true);

  return (
    <AlertDialog
      open={state.status === "confirming"}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      onOpenChangeComplete={(open) => {
        if (!open) completeConfirmDialogClose();
      }}
    >
      <AlertDialogPopup
        className="embedino-confirm-dialog max-w-[30rem]"
        data-variant={isDestructive ? "destructive" : "default"}
      >
        <AlertDialogHeader className="gap-2 p-6 text-left">
          <AlertDialogTitle className="text-base font-medium leading-6">
            {copy.title}
          </AlertDialogTitle>
          {copy.description ? (
            <AlertDialogDescription className="max-w-[34rem] whitespace-pre-line leading-5">
              {copy.description}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter variant="bare" className="flex-row justify-end gap-2 px-6 pb-6">
          <AlertDialogClose render={<Button size="sm" variant="outline" />}>
            Cancel
          </AlertDialogClose>
          <Button size="sm" variant={confirmVariant} onClick={onConfirm}>
            {isDestructive ? "Delete thread" : "Confirm"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
