/**
 * EmbedinoProjectFileLoader - Effect service that loads the checked-in `embedino.json`
 * project file from a workspace root.
 *
 * Loading is best-effort: a missing file resolves to `Option.none`, and
 * unreadable or invalid files are logged and treated as absent so callers
 * can fall back to their defaults.
 *
 * @module EmbedinoProjectFileLoader
 */
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Path from "effect/Path";
import * as Schema from "effect/Schema";

import { EMBEDINO_PROJECT_FILE_NAME, type EmbedinoProjectFile } from "@embedino/contracts";
import { EmbedinoProjectFileFromJson } from "@embedino/shared/embedinoProjectFile";

const decodeEmbedinoProjectFileJson = Schema.decodeEffect(EmbedinoProjectFileFromJson);

export class EmbedinoProjectFileLoadError extends Schema.TaggedErrorClass<EmbedinoProjectFileLoadError>()(
  "EmbedinoProjectFileLoadError",
  {
    operation: Schema.Literals(["read", "decode"]),
    workspaceRoot: Schema.String,
    filePath: Schema.String,
    cause: Schema.Defect(),
  },
) {
  override get message(): string {
    return `Failed to ${this.operation} ${EMBEDINO_PROJECT_FILE_NAME} at ${this.filePath}.`;
  }
}

/** Service tag for embedino.json project file loading. */
export class EmbedinoProjectFileLoader extends Context.Service<
  EmbedinoProjectFileLoader,
  {
    /**
     * Load and decode `embedino.json` at the workspace root.
     *
     * Never fails: missing, unreadable, or invalid files resolve to
     * `Option.none` (invalid files are logged as warnings).
     */
    readonly load: (workspaceRoot: string) => Effect.Effect<Option.Option<EmbedinoProjectFile>>;
  }
>()("embedino/project/EmbedinoProjectFileLoader") {}

const logEmbedinoProjectFileLoadError = (error: EmbedinoProjectFileLoadError) =>
  Effect.logWarning(error).pipe(
    Effect.annotateLogs({
      operation: error.operation,
      workspaceRoot: error.workspaceRoot,
      filePath: error.filePath,
      errorTag: error._tag,
    }),
  );

export const make = Effect.gen(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const load: EmbedinoProjectFileLoader["Service"]["load"] = Effect.fn(
    "EmbedinoProjectFileLoader.load",
  )(function* (workspaceRoot) {
    const filePath = path.join(workspaceRoot, EMBEDINO_PROJECT_FILE_NAME);
    const raw = yield* fileSystem.readFileString(filePath).pipe(
      Effect.map(Option.some),
      Effect.catchTags({
        PlatformError: (error) =>
          error.reason._tag === "NotFound"
            ? Effect.succeed(Option.none<string>())
            : logEmbedinoProjectFileLoadError(
                new EmbedinoProjectFileLoadError({
                  operation: "read",
                  workspaceRoot,
                  filePath,
                  cause: error,
                }),
              ).pipe(Effect.as(Option.none<string>())),
      }),
    );
    if (Option.isNone(raw)) {
      return Option.none<EmbedinoProjectFile>();
    }
    return yield* decodeEmbedinoProjectFileJson(raw.value).pipe(
      Effect.map(Option.some),
      Effect.catchTags({
        SchemaError: (error) =>
          logEmbedinoProjectFileLoadError(
            new EmbedinoProjectFileLoadError({
              operation: "decode",
              workspaceRoot,
              filePath,
              cause: error,
            }),
          ).pipe(Effect.as(Option.none<EmbedinoProjectFile>())),
      }),
    );
  });

  return EmbedinoProjectFileLoader.of({ load });
});

export const layer = Layer.effect(EmbedinoProjectFileLoader, make);
