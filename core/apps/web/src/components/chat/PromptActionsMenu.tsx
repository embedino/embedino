import type { ReactNode } from "react";
import { useState } from "react";
import { Plus } from "lucide-react";

import { cn } from "~/lib/utils";
import { Popover, PopoverPopup, PopoverTrigger } from "../ui/popover";

export interface PromptActionItem {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
}

interface PromptActionsMenuProps {
  actions: ReadonlyArray<PromptActionItem>;
  onAction?: (action: PromptActionItem) => void;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  triggerAriaLabel?: string;
}

const promptActionRowClassName =
  "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted data-highlighted:bg-muted disabled:pointer-events-none disabled:opacity-50";

/**
 * The beUI-style "+" prompt actions menu: a round ghost button whose plus
 * glyph rotates 45° while open, opening a compact action list upward.
 * Rotation runs on a compositor-only CSS spring curve (no JS animation lib).
 */
export function PromptActionsMenu({
  actions,
  onAction,
  disabled,
  className,
  triggerClassName,
  contentClassName,
  triggerAriaLabel = "Add to prompt",
}: PromptActionsMenuProps) {
  const [open, setOpen] = useState(false);

  if (actions.length === 0) return null;

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
      }}
      modal={false}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            disabled={disabled}
            aria-label={triggerAriaLabel}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={cn(
              "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted disabled:pointer-events-none disabled:opacity-64 [&_svg]:pointer-events-none [&_svg]:shrink-0",
              triggerClassName,
            )}
          />
        }
      >
        <Plus
          aria-hidden="true"
          className="size-4 transition-transform duration-300 [transition-timing-function:var(--ease-prompt-spring)] motion-reduce:transition-none"
          style={{ transform: open ? "rotate(45deg)" : undefined }}
        />
      </PopoverTrigger>
      <PopoverPopup
        side="top"
        align="start"
        sideOffset={8}
        className={cn(
          "w-56 rounded-xl border border-border bg-background p-1.5 shadow-[0_10px_18px_rgba(0,0,0,0.14)] before:hidden [-webkit-backdrop-filter:none]! [--viewport-inline-padding:0] [backdrop-filter:none]!",
          contentClassName,
        )}
        viewportClassName="rounded-[inherit] overflow-hidden p-0!"
      >
        <div className={cn("flex flex-col", className)} data-slot="prompt-actions-menu">
          {actions.map((action) => (
            <button
              key={action.value}
              type="button"
              disabled={disabled || undefined}
              onClick={() => {
                onAction?.(action);
                setOpen(false);
              }}
              className={promptActionRowClassName}
            >
              {action.icon ? (
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center text-muted-foreground [&_svg]:size-4">
                  {action.icon}
                </span>
              ) : null}
              <span className="min-w-0">
                <span className="block text-sm text-foreground">{action.label}</span>
                {action.description ? (
                  <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
                    {action.description}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      </PopoverPopup>
    </Popover>
  );
}
