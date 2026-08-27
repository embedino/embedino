import * as Exit from "effect/Exit";
import * as Schema from "effect/Schema";

import { EmbedinoProjectFile, EMBEDINO_PROJECT_FILE_SCHEMA_URL } from "@embedino/contracts";

import { fromLenientJson } from "./schemaJson.ts";

/**
 * Codec between the raw `embedino.json` file contents (lenient JSONC string) and the
 * decoded {@link EmbedinoProjectFile}.
 */
export const EmbedinoProjectFileFromJson = fromLenientJson(EmbedinoProjectFile);

const decodeEmbedinoProjectFile = Schema.decodeExit(EmbedinoProjectFileFromJson);

/**
 * Decode raw `embedino.json` contents, treating invalid or malformed files as
 * absent. Clients use this to read optional defaults (scripts, thread env
 * mode) without surfacing decode errors to the user.
 */
export function parseEmbedinoProjectFile(contents: string): EmbedinoProjectFile | null {
  const decoded = decodeEmbedinoProjectFile(contents);
  return Exit.isSuccess(decoded) ? decoded.value : null;
}

/**
 * Build the publishable JSON Schema document for `embedino.json` (draft 2020-12).
 *
 * Served from the marketing site at {@link EMBEDINO_PROJECT_FILE_SCHEMA_URL} so
 * editors get LSP support via a `$schema` reference.
 */
export function buildEmbedinoProjectFileJsonSchema(): Record<string, unknown> {
  const document = Schema.toJsonSchemaDocument(EmbedinoProjectFile);
  const jsonSchema: Record<string, unknown> = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: EMBEDINO_PROJECT_FILE_SCHEMA_URL,
    ...document.schema,
  };
  if (document.definitions && Object.keys(document.definitions).length > 0) {
    jsonSchema.$defs = document.definitions;
  }
  return jsonSchema;
}
