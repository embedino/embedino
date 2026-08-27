import * as Option from "effect/Option";

export type JoinPath = (first: string, ...segments: string[]) => string;

function normalizeConfiguredBaseDir(embedinoHome: Option.Option<string>): Option.Option<string> {
  if (Option.isNone(embedinoHome)) {
    return Option.none();
  }
  const trimmed = embedinoHome.value.trim();
  return trimmed.length > 0 ? Option.some(trimmed) : Option.none();
}

export function resolveDesktopBaseDir(input: {
  readonly homeDirectory: string;
  readonly joinPath: JoinPath;
  readonly embedinoHome: Option.Option<string>;
}): string {
  return Option.getOrElse(normalizeConfiguredBaseDir(input.embedinoHome), () =>
    input.joinPath(input.homeDirectory, ".embedino"),
  );
}

export function resolveDesktopStateDir(input: {
  readonly baseDir: string;
  readonly isDevelopment: boolean;
  readonly joinPath: JoinPath;
  readonly embedinoHome: Option.Option<string>;
}): string {
  const useDevSubdir =
    input.isDevelopment && Option.isNone(normalizeConfiguredBaseDir(input.embedinoHome));
  return input.joinPath(input.baseDir, useDevSubdir ? "dev" : "userdata");
}
