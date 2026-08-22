import { memo, type ReactNode } from "react";

import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export type ChatEnvironmentIssueState = "ok" | "connecting" | "reconnecting" | "offline";
export type ChatUpdateIssueState = "idle" | "available" | "updating" | "failed";

export interface ChatSystemStatusIssue {
  key: string;
  tone: "warning" | "destructive" | "info";
  pulse: boolean;
  title: string;
  detail: ReactNode | null;
  action?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export interface ChatStatusIndicatorProps {
  issues: ReadonlyArray<ChatSystemStatusIssue>;
}

const TONE_DOT_CLASSES: Record<ChatSystemStatusIssue["tone"], string> = {
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
};

const ISSUE_SEVERITY: Record<ChatSystemStatusIssue["tone"], number> = {
  destructive: 0,
  warning: 1,
  info: 2,
};

function summarizeIssues(issues: ReadonlyArray<ChatSystemStatusIssue>): {
  tone: ChatSystemStatusIssue["tone"];
  pulse: boolean;
  label: string;
} | null {
  if (issues.length === 0) return null;
  const top = issues.reduce((worst, issue) =>
    ISSUE_SEVERITY[issue.tone] < ISSUE_SEVERITY[worst.tone] ? issue : worst,
  );
  return {
    tone: top.tone,
    pulse: issues.some((issue) => issue.pulse),
    label:
      issues.length === 1
        ? top.title
        : `${top.title.replace(/…$/, "")} · ${issues.length - 1} more`,
  };
}

export const ChatStatusIndicator = memo(function ChatStatusIndicator({
  issues,
}: ChatStatusIndicatorProps) {
  const summary = summarizeIssues(issues);
  if (summary === null) {
    return null;
  }
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Workspace status: ${summary.label}`}
        className={cn(
          "inline-flex h-6 max-w-56 shrink-0 items-center gap-1.5 rounded-md border border-border/50 bg-card/60 px-2 text-[11px] leading-none text-muted-foreground outline-none transition-colors",
          "hover:border-border/80 hover:bg-accent/60 hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring/60",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            TONE_DOT_CLASSES[summary.tone],
            summary.pulse && "animate-status-pulse",
          )}
        />
        <span className="truncate">{summary.label}</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-1" sideOffset={6}>
        <div role="status" aria-label="Workspace status">
          {issues.map((issue) => (
            <div key={issue.key} className="flex items-start gap-2 rounded-md px-2 py-2">
              <span
                aria-hidden="true"
                className={cn(
                  "mt-[5px] size-1.5 shrink-0 rounded-full",
                  TONE_DOT_CLASSES[issue.tone],
                  issue.pulse && "animate-status-pulse",
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-foreground text-xs">{issue.title}</div>
                {issue.detail !== null && (
                  <div className="mt-0.5 text-[11px] break-words text-muted-foreground leading-snug">
                    {issue.detail}
                  </div>
                )}
                {(issue.action !== undefined || issue.onDismiss !== undefined) && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {issue.action}
                    {issue.onDismiss !== undefined && (
                      <Button
                        aria-label={issue.dismissLabel ?? "Dismiss"}
                        onClick={issue.onDismiss}
                        size="xs"
                        variant="ghost"
                      >
                        Dismiss
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
});
