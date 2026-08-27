import type { ScopedProjectRef, ScopedThreadRef } from "@embedino/contracts";
import { useMemo } from "react";

import { useComposerDraftStore, type DraftId } from "../composerDraftStore";
import { useThreadShellsForProjectRefs } from "../state/entities";
import { resolvePreviousWorktreeLabel, resolvePreviousWorktreeSeed } from "./BranchToolbar.logic";

export interface PreviousWorktreeOption {
  label: string;
  onUse: () => void;
}

/**
 * "Previous worktree" hops a draft into the most recently active worktree of
 * this project — the "keep going where I just was" follow-up flow. Only drafts
 * can hop; started server threads have their workspace pinned.
 *
 * Shared by the BranchToolbar strip and the in-composer workspace pill so both
 * entry points stay in sync.
 */
export function usePreviousWorktreeOption(input: {
  enabled: boolean;
  activeProjectRef: ScopedProjectRef | null;
  currentWorktreePath: string | null;
  draftId?: DraftId | null;
  threadRef: ScopedThreadRef;
}): PreviousWorktreeOption | null {
  const { enabled, activeProjectRef, currentWorktreePath, draftId, threadRef } = input;
  const setDraftThreadContext = useComposerDraftStore((store) => store.setDraftThreadContext);
  const projectRefsForWorktreeLookup = useMemo(
    () => (enabled && activeProjectRef ? [activeProjectRef] : []),
    [activeProjectRef, enabled],
  );
  const projectThreads = useThreadShellsForProjectRefs(projectRefsForWorktreeLookup);
  const previousWorktreeSeed = useMemo(
    () =>
      enabled
        ? resolvePreviousWorktreeSeed({ threads: projectThreads, currentWorktreePath })
        : null,
    [currentWorktreePath, enabled, projectThreads],
  );
  const label = previousWorktreeSeed ? resolvePreviousWorktreeLabel(previousWorktreeSeed) : null;
  const onUse = useMemo(() => {
    if (!previousWorktreeSeed || !activeProjectRef) return undefined;
    // Same shape the branch selector writes when picking a branch that already
    // lives in a worktree: point the draft at the existing tree.
    return () => {
      setDraftThreadContext(draftId ?? threadRef, {
        branch: previousWorktreeSeed.branch,
        worktreePath: previousWorktreeSeed.worktreePath,
        envMode: "worktree",
        projectRef: activeProjectRef,
      });
    };
  }, [activeProjectRef, draftId, previousWorktreeSeed, setDraftThreadContext, threadRef]);
  if (!label || !onUse) return null;
  return { label, onUse };
}
