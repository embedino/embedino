import type { ExecutionEnvironmentPlatformOs } from "@embedino/contracts";

function isWindowsPath(value: string): boolean {
  return /^[A-Za-z]:[\\/]/.test(value) || value.startsWith("\\\\");
}

export function quoteHardwareShellArgument(
  value: string,
  hostOs: ExecutionEnvironmentPlatformOs,
): string {
  if (hostOs === "windows") {
    return `'${value.replaceAll("'", "''")}'`;
  }
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

export function hardwareExecutableInvocation(input: {
  readonly resolvedPath: string | null;
  readonly fallbackCommand: string;
  readonly hostOs: ExecutionEnvironmentPlatformOs;
}): string {
  if (input.resolvedPath === null) return input.fallbackCommand;
  const quoted = quoteHardwareShellArgument(input.resolvedPath, input.hostOs);
  // Embedino terminals use PowerShell on Windows. A quoted executable is an
  // expression there, so it must be invoked with the call operator. Path
  // detection covers older servers that report an unknown host OS.
  return input.hostOs === "windows" || isWindowsPath(input.resolvedPath) ? `& ${quoted}` : quoted;
}

export function arduinoSketchDirectory(inoRelativePath: string | null): string {
  if (inoRelativePath === null) return ".";
  const normalized = inoRelativePath.replaceAll("\\", "/");
  const lastSlashIndex = normalized.lastIndexOf("/");
  return lastSlashIndex < 0 ? "." : `./${normalized.slice(0, lastSlashIndex)}`;
}
