// @effect-diagnostics nodeBuiltinImport:off
import * as NodeFSP from "node:fs/promises";
import * as NodeOS from "node:os";
import * as NodePath from "node:path";

import * as NodeServices from "@effect/platform-node/NodeServices";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";

import {
  embedinoRuleFilePath,
  ensureGitExcludeEntry,
  releaseCursorHardwareRule,
  removeGitExcludeEntry,
  writeCursorHardwareRule,
} from "./CursorRulesFile.ts";

const makeTempWorkspace = Effect.promise(() =>
  NodeFSP.mkdtemp(NodePath.join(NodeOS.tmpdir(), "cursor-rules-test-")),
);

const readIfExists = (filePath: string) =>
  Effect.promise(() =>
    NodeFSP.readFile(filePath, "utf8").then(
      (content) => content,
      () => null,
    ),
  );

describe("CursorRulesFile", () => {
  it.effect(
    "writes the rule file with frontmatter and removes it on release when none existed before",
    () =>
      Effect.gen(function* () {
        const fileSystem = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const workspace = yield* makeTempWorkspace;
        const filePath = embedinoRuleFilePath(path, workspace);

        const previousContent = yield* writeCursorHardwareRule({
          fileSystem,
          path,
          cwd: workspace,
          content: "<hardware_state>Port COM3</hardware_state>",
        });
        expect(previousContent).toBeNull();

        const written = yield* readIfExists(filePath);
        expect(written).toContain("alwaysApply: true");
        expect(written).toContain("<hardware_state>Port COM3</hardware_state>");

        yield* releaseCursorHardwareRule({
          fileSystem,
          path,
          cwd: workspace,
          previousContent,
        });

        // File and the directories we created are cleaned up.
        expect(yield* readIfExists(filePath)).toBeNull();
        const rulesDirExists = yield* Effect.promise(() =>
          NodeFSP.access(NodePath.join(workspace, ".cursor")).then(
            () => true,
            () => false,
          ),
        );
        expect(rulesDirExists).toBe(false);
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer)),
  );

  it.effect("restores pre-existing user content on release", () =>
    Effect.gen(function* () {
      const fileSystem = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const workspace = yield* makeTempWorkspace;
      const filePath = embedinoRuleFilePath(path, workspace);
      yield* Effect.promise(() =>
        NodeFSP.mkdir(NodePath.join(workspace, ".cursor", "rules"), { recursive: true }),
      );
      yield* Effect.promise(() => NodeFSP.writeFile(filePath, "USER RULES", "utf8"));

      const previousContent = yield* writeCursorHardwareRule({
        fileSystem,
        path,
        cwd: workspace,
        content: "<hardware_state></hardware_state>",
      });
      expect(previousContent).toBe("USER RULES");

      yield* releaseCursorHardwareRule({
        fileSystem,
        path,
        cwd: workspace,
        previousContent,
      });
      expect(yield* readIfExists(filePath)).toBe("USER RULES");
    }).pipe(Effect.scoped, Effect.provide(NodeServices.layer)),
  );

  it.effect("adds and removes the git exclude entry idempotently", () =>
    Effect.gen(function* () {
      const fileSystem = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const workspace = yield* makeTempWorkspace;
      const excludePath = NodePath.join(workspace, ".git", "info", "exclude");
      yield* Effect.promise(() =>
        NodeFSP.mkdir(NodePath.join(workspace, ".git", "info"), { recursive: true }),
      );

      yield* ensureGitExcludeEntry({ fileSystem, path, cwd: workspace });
      yield* ensureGitExcludeEntry({ fileSystem, path, cwd: workspace });
      let exclude = yield* readIfExists(excludePath);
      const entryLines = (exclude ?? "")
        .split("\n")
        .filter((line) => line.trim() === ".cursor/rules/embedino-hardware.mdc");
      expect(entryLines.length).toBe(1);

      yield* removeGitExcludeEntry({ fileSystem, path, cwd: workspace });
      exclude = yield* readIfExists(excludePath);
      expect(exclude).not.toContain("embedino-hardware.mdc");
    }).pipe(Effect.scoped, Effect.provide(NodeServices.layer)),
  );
});
