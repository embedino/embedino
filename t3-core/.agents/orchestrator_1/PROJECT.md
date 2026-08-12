# Project: t3-core Refactoring & Beta Release

## Architecture

- Monorepo structure using pnpm workspaces:
  - `apps/web`: React/TypeScript frontend (Next/TanStack Router, Effect-Atom, Tailwind, Ghostty Wasm terminal)
  - `apps/server`: Node.js server toolchain services (`ToolchainService.ts`, etc.)
- Interfaces & State: Toolchain state engine (`apps/web/src/state/toolchain.ts`), ToolchainSetup UI (`apps/web/src/components/wiring/ToolchainSetup.tsx`), Settings integration (`apps/web/src/components/settings/SettingsPanels.tsx`).

## Code Layout

- Frontend code: `apps/web/src/`
  - Components: `apps/web/src/components/`
  - State: `apps/web/src/state/`
- Server code: `apps/server/src/`
  - Toolchain: `apps/server/src/toolchain/`
- Config files: `package.json`, `apps/web/package.json`, `tsconfig.json`

## Feature Inventory

| #   | Feature                                 | Description                                                                                                                                                    | Milestone | Source              |
| --- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------- |
| 1   | R1.1 Toolchain State Refactor           | Replace raw module singleton in `ToolchainSetup.tsx` and `as any` cast in `state/toolchain.ts` with clean, strongly typed Effect state engine                  | M1        | survey (Explorer 1) |
| 2   | R1.2 Toolchain Component Cleanup        | Fix 6 TypeScript compilation errors, Effect cause/failure handling, out-of-scope `fetchStatus` calls, unused callbacks, and hex colors in `ToolchainSetup.tsx` | M1        | survey (Explorer 1) |
| 3   | R1.3 Settings UI State Integration      | Fix `SettingsPanels.tsx` select state locking on "Manage Toolchain..." selection                                                                               | M1        | survey (Explorer 1) |
| 4   | R1.4 Server Toolchain Namespace Imports | Fix `ToolchainService.ts` node namespace imports (`node:child_process`, `node:fs`, `node:path`) to satisfy `pnpm lint`                                         | M1        | survey (Explorer 1) |
| 5   | R2 Upstream T3 Tracking                 | Add upstream T3 version comment (`pingdotgg/t3code@v0.0.33`) directly in `package.json`                                                                        | M2        | survey (Explorer 2) |
| 6   | R3 Verification & Git Push              | Run full verification (`tsc --noEmit`, `npm run lint`, `npm run build`), commit changes, and push to `beta` branch on `embedino/embedino`                      | M3        | survey (Explorer 3) |

## Milestones

| #   | Name                                            | Scope                                                                                                                                                           | Dependencies | Status      |
| --- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------- |
| 1   | M1: Comprehensive Frontend & Toolchain Refactor | Refactor `apps/web/src/state/toolchain.ts`, `ToolchainSetup.tsx`, `SettingsPanels.tsx`, and `ToolchainService.ts` to resolve all TS/ESLint errors and AI smells | none         | IN_PROGRESS |
| 2   | M2: T3 Upstream Version Tracking                | Add JSON-compliant T3 upstream tracking comments to `package.json`                                                                                              | M1           | PLANNED     |
| 3   | M3: Verification, Commit & Git Push             | Execute full project verification (`tsc --noEmit`, `pnpm lint`, `pnpm build`), git commit, and `git push origin beta`                                           | M1, M2       | PLANNED     |

## Interface Contracts

### `apps/web/src/state/toolchain.ts`

- `useActiveToolchain()`: Returns strictly typed `["platformio" | "arduino" | null, (val: "platformio" | "arduino" | null) => void]`.
- `useToolchainStatus()`: Reactive hook returning `{ status: ToolchainStatus | null, loading: boolean, error: string | null, refetch: () => void }`.
