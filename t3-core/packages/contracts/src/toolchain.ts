import * as Schema from "effect/Schema";

export const ToolchainInstallProgressEvent = Schema.Struct({
  type: Schema.Literal("progress"),
  progress: Schema.Number,
  stdout: Schema.optional(Schema.String),
  stderr: Schema.optional(Schema.String),
});
export type ToolchainInstallProgressEvent = Schema.Schema.Type<typeof ToolchainInstallProgressEvent>;

export class ToolchainInstallError extends Schema.TaggedErrorClass<ToolchainInstallError>()(
  "ToolchainInstallError",
  {
    message: Schema.String,
    details: Schema.optional(Schema.String),
  }
) {}

export const ToolchainStatus = Schema.Struct({
  platformioInstalled: Schema.Boolean,
  platformioVersion: Schema.NullOr(Schema.String),
  arduinoInstalled: Schema.Boolean,
  arduinoVersion: Schema.NullOr(Schema.String),
});
export type ToolchainStatus = Schema.Schema.Type<typeof ToolchainStatus>;
