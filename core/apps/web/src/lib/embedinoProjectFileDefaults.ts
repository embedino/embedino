import { EMBEDINO_PROJECT_FILE_NAME, type EnvironmentId, type ThreadEnvMode } from "@embedino/contracts";
import { parseEmbedinoProjectFile } from "@embedino/shared/embedinoProjectFile";
import { executeAtomQuery } from "@embedino/client-runtime/state/runtime";

import {
  getProjectFileQueryAtom,
  resolveProjectFileQueryData,
} from "~/components/files/projectFilesQueryState";
import { appAtomRegistry } from "~/rpc/atomRegistry";

/**
 * Read `defaultThreadEnvMode` from the project's checked-in `embedino.json`.
 *
 * Imperative counterpart to `useEmbedinoProjectFileScripts` for the new-thread
 * path, which resolves defaults at call time rather than render time. The
 * file query atom caches per (environment, cwd), so repeat calls don't
 * re-fetch. Optimistic in-app writes overlay the query result, matching what
 * `useProjectFileQuery` renders. Missing, truncated, or invalid files
 * resolve to null.
 */
export async function readEmbedinoProjectFileDefaultThreadEnvMode(
  environmentId: EnvironmentId,
  workspaceRoot: string,
): Promise<ThreadEnvMode | null> {
  const result = await executeAtomQuery(
    appAtomRegistry,
    getProjectFileQueryAtom(environmentId, workspaceRoot, EMBEDINO_PROJECT_FILE_NAME),
    { reportDefect: false, reportFailure: false },
  );
  const data = resolveProjectFileQueryData(
    environmentId,
    workspaceRoot,
    EMBEDINO_PROJECT_FILE_NAME,
    result._tag === "Success" ? result.value : null,
  );
  if (data === null || data.truncated) return null;
  return parseEmbedinoProjectFile(data.contents)?.defaultThreadEnvMode ?? null;
}
