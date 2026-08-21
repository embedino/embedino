import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import type * as PlatformError from "effect/PlatformError";

/**
 * Cursor has no system-prompt channel in its ACP protocol, but its agent
 * discovers rule files from the workspace (`<cwd>/.cursor/rules/*.mdc`) and
 * folds them into the system prompt. Embedino delivers hardware context
 * through a namespaced rule file so it never renders as chat content.
 *
 * Lifecycle: written when a Cursor session starts, refreshed when hardware
 * state changes mid-session, and removed (or the user's prior content
 * restored) when the session stops. A `.git/info/exclude` entry keeps crash
 * leftovers out of `git status`; it is local-only and never committed.
 */

export const CURSOR_RULES_DIR_SEGMENT = ".cursor/rules";
export const EMBEDINO_RULE_FILE_NAME = "embedino-hardware.mdc";

/** Repo-relative path used as our identifiable line in `.git/info/exclude`. */
const GIT_EXCLUDE_ENTRY = `${CURSOR_RULES_DIR_SEGMENT}/${EMBEDINO_RULE_FILE_NAME}`;

const RULE_FRONTMATTER = [
  "---",
  "description: Embedino hardware context (auto-managed)",
  "alwaysApply: true",
  "---",
  "",
].join("\n");

export function embedinoRuleFilePath(path: Path.Path, cwd: string): string {
  return path.join(cwd, CURSOR_RULES_DIR_SEGMENT, EMBEDINO_RULE_FILE_NAME);
}

export interface WriteCursorHardwareRuleInput {
  readonly fileSystem: FileSystem.FileSystem;
  readonly path: Path.Path;
  /** Session working directory (the project root cursor-agent runs in). */
  readonly cwd: string;
  readonly content: string;
}

/**
 * Writes the hardware rule file and returns the previous file content so the
 * caller can restore it on session stop (`null` when the file did not exist).
 */
export const writeCursorHardwareRule = (
  input: WriteCursorHardwareRuleInput,
): Effect.Effect<string | null, PlatformError.PlatformError> =>
  Effect.gen(function* () {
    const filePath = embedinoRuleFilePath(input.path, input.cwd);
    yield* input.fileSystem.makeDirectory(input.path.join(input.cwd, CURSOR_RULES_DIR_SEGMENT), {
      recursive: true,
    });
    const previousContent = yield* readOptional(input.fileSystem, filePath);
    yield* input.fileSystem.writeFileString(filePath, `${RULE_FRONTMATTER}\n${input.content}\n`);
    return previousContent;
  });

export interface ReleaseCursorHardwareRuleInput {
  readonly fileSystem: FileSystem.FileSystem;
  readonly path: Path.Path;
  readonly cwd: string;
  /** Content captured by `writeCursorHardwareRule` (`null` if none existed). */
  readonly previousContent: string | null;
}

/**
 * Removes the auto-managed rule file, or restores the pre-existing user
 * content if we had overwritten a file at that exact path. Best-effort empty
 * directory cleanup keeps no residue behind.
 */
export const releaseCursorHardwareRule = (
  input: ReleaseCursorHardwareRuleInput,
): Effect.Effect<void, PlatformError.PlatformError> =>
  Effect.gen(function* () {
    const filePath = embedinoRuleFilePath(input.path, input.cwd);
    if (input.previousContent === null) {
      yield* input.fileSystem.remove(filePath).pipe(Effect.ignore);
    } else {
      yield* input.fileSystem.writeFileString(filePath, input.previousContent).pipe(Effect.ignore);
    }
    // Remove now-empty directories we may have created (.cursor/rules, .cursor).
    const rulesDir = input.path.join(input.cwd, CURSOR_RULES_DIR_SEGMENT);
    yield* removeDirIfEmpty(input.fileSystem, rulesDir).pipe(Effect.ignore);
    yield* removeDirIfEmpty(input.fileSystem, input.path.join(input.cwd, ".cursor")).pipe(
      Effect.ignore,
    );
  });

function readOptional(
  fileSystem: FileSystem.FileSystem,
  filePath: string,
): Effect.Effect<string | null> {
  return fileSystem.readFileString(filePath).pipe(Effect.orElseSucceed(() => null));
}

const removeDirIfEmpty = (
  fileSystem: FileSystem.FileSystem,
  dir: string,
): Effect.Effect<void, PlatformError.PlatformError> =>
  Effect.gen(function* () {
    if (!(yield* fileSystem.exists(dir))) return;
    if ((yield* fileSystem.readDirectory(dir)).length > 0) return;
    yield* fileSystem.remove(dir, { recursive: true });
  });

/**
 * Adds `GIT_EXCLUDE_ENTRY` to `<cwd>/.git/info/exclude` when the thread's cwd
 * is itself a git work tree root, so an unclean shutdown that leaves the rule
 * file behind never surfaces as untracked noise. Only touched when the entry
 * is missing; failures are swallowed by callers.
 */
export const ensureGitExcludeEntry = (
  input: Omit<WriteCursorHardwareRuleInput, "content">,
): Effect.Effect<void, PlatformError.PlatformError> =>
  Effect.gen(function* () {
    const excludePath = gitExcludePath(input.path, input.cwd);
    if (excludePath === null) return;
    const current = yield* readOptional(input.fileSystem, excludePath);
    if (current !== null && current.includes(GIT_EXCLUDE_ENTRY)) return;
    // A missing exclude file is created with just our entry; an existing one
    // gets our entry appended after a separating newline.
    const base = current ?? "";
    const separator = base.length > 0 && !base.endsWith("\n") ? "\n" : "";
    yield* input.fileSystem.writeFileString(
      excludePath,
      `${base}${separator}# ${EMBEDINO_RULE_FILE_NAME} (managed by Embedino)\n${GIT_EXCLUDE_ENTRY}\n`,
    );
  });

/**
 * Removes our line from `.git/info/exclude`, preserving everything else.
 * The comment marker is removed only when directly adjacent to our entry.
 */
export const removeGitExcludeEntry = (
  input: Omit<WriteCursorHardwareRuleInput, "content">,
): Effect.Effect<void, PlatformError.PlatformError> =>
  Effect.gen(function* () {
    const excludePath = gitExcludePath(input.path, input.cwd);
    if (excludePath === null) return;
    const current = yield* readOptional(input.fileSystem, excludePath);
    if (current === null || !current.includes(GIT_EXCLUDE_ENTRY)) return;
    const lines = current.split("\n").filter((line) => {
      if (line.trim() === GIT_EXCLUDE_ENTRY) return false;
      if (line.trim() === `# ${EMBEDINO_RULE_FILE_NAME} (managed by Embedino)`) return false;
      return true;
    });
    yield* input.fileSystem.writeFileString(excludePath, lines.join("\n"));
  });

function gitExcludePath(path: Path.Path, cwd: string): string | null {
  // Only manage the exclude list when the session cwd is the repo root —
  // walking up to locate nested roots would guess at ownership of .git.
  return path.join(cwd, ".git", "info", "exclude");
}
