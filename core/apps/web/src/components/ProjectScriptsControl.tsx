import type { ProjectScript, ResolvedKeybindingsConfig } from "@embedino/contracts";
import { PlusIcon } from "lucide-react";
import { useCallback, useState } from "react";

import {
  EMPTY_PROJECT_SCRIPT_INPUT,
  ProjectScriptEditorDialog,
  type NewProjectScriptInput,
  type ProjectScriptActionResult,
  type ProjectScriptEditorRequest,
} from "./projectScriptEditor";
import { Button } from "./ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "./ui/tooltip";

export type { NewProjectScriptInput, ProjectScriptActionResult };

const EMPTY_KEYBINDINGS: ResolvedKeybindingsConfig = [];

interface ProjectScriptsControlProps {
  scripts: ReadonlyArray<ProjectScript>;
  keybindings?: ResolvedKeybindingsConfig;
  onAddScript: (input: NewProjectScriptInput) => Promise<ProjectScriptActionResult>;
  onUpdateScript: (
    scriptId: string,
    input: NewProjectScriptInput,
  ) => Promise<ProjectScriptActionResult>;
  onDeleteScript: (scriptId: string) => Promise<ProjectScriptActionResult>;
}

/**
 * A single compact "+" control that opens the add-action editor directly.
 * Existing actions stay runnable through their keybindings and the command
 * palette; editing happens from the editor dialog itself.
 */
export default function ProjectScriptsControl({
  scripts,
  keybindings = EMPTY_KEYBINDINGS,
  onAddScript,
  onUpdateScript,
  onDeleteScript,
}: ProjectScriptsControlProps) {
  const [editorRequest, setEditorRequest] = useState<ProjectScriptEditorRequest | null>(null);

  const openAddDialog = useCallback(() => {
    setEditorRequest({ scriptId: null, initial: EMPTY_PROJECT_SCRIPT_INPUT });
  }, []);

  const submitScript = useCallback(
    (scriptId: string | null, input: NewProjectScriptInput) =>
      scriptId === null ? onAddScript(input) : onUpdateScript(scriptId, input),
    [onAddScript, onUpdateScript],
  );

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="xs"
              variant="outline"
              className="w-7 px-0 sm:w-6"
              aria-label="Add action"
              // The tooltip wrapper replaces data-slot="button", so themed
              // toolbar styling needs its own hook.
              data-toolbar-control=""
              onClick={openAddDialog}
            />
          }
        >
          <PlusIcon className="size-3.5" />
          <span className="sr-only">Add action</span>
        </TooltipTrigger>
        <TooltipPopup side="bottom">Add action</TooltipPopup>
      </Tooltip>

      <ProjectScriptEditorDialog
        request={editorRequest}
        scripts={scripts}
        keybindings={keybindings}
        onSubmit={submitScript}
        onDelete={(scriptId) => void onDeleteScript(scriptId)}
        onClose={() => setEditorRequest(null)}
      />
    </>
  );
}
