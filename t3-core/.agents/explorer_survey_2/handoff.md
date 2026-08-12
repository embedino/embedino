# Handoff Report — Requirement R2: Upstream T3 Tracking

## 1. Observation

Direct observations from codebase inspection across `c:\Users\rapid\Desktop\embedino workspace\t3-core`:

- **Root Monorepo Metadata** (`package.json`):
  - Line 2: `"name": "@t3tools/monorepo"`
  - Line 3: `"private": true`
  - Line 4: `"type": "module"`
  - Line 60: `"packageManager": "pnpm@11.10.0"`
  - Line 58: `"engines": { "node": "^24.13.1" }`

- **Web App Package Metadata** (`apps/web/package.json`):
  - Line 2: `"name": "@t3tools/web"`
  - Line 3: `"version": "0.0.33"`
  - Dependencies:
    - `"react": "19.2.6"`, `"react-dom": "19.2.6"`
    - `"@tanstack/react-router": "^1.160.2"`
    - `"@tailwindcss/vite": "^4.0.0"`, `"tailwindcss": "^4.0.0"`
    - `"effect": "catalog:"` (Catalog version: `4.0.0-beta.103` in `pnpm-workspace.yaml`)
    - `"@clerk/react": "catalog:"` (Catalog version: `6.12.10` in `pnpm-workspace.yaml`)
    - `"zustand": "^5.0.11"`
    - `"vite-plus": "catalog:"` (Catalog version: `0.2.2` in `pnpm-workspace.yaml`)

- **Server Package & Upstream Repository Metadata** (`apps/server/package.json`):
  - Line 2: `"name": "t3"`
  - Line 3: `"version": "0.0.33"`
  - Line 5-9:
    ```json
    "repository": {
      "type": "git",
      "url": "https://github.com/pingdotgg/t3code",
      "directory": "apps/server"
    }
    ```

- **Desktop App Package Metadata** (`apps/desktop/package.json`):
  - Line 2: `"name": "@t3tools/desktop"`
  - Line 3: `"version": "0.0.33"`
  - Line 38: `"productName": "T3 Code (Alpha)"`

- **Shared Contracts Package Metadata** (`packages/contracts/package.json`):
  - Line 2: `"name": "@t3tools/contracts"`
  - Line 3: `"version": "0.0.33"`

- **Git Remote & Repository Identification**:
  - Remote (`git remote -v`): `origin https://github.com/embedino/embedino`
  - Lockfile (`pnpm-lock.yaml`): References `oxlint-plugin-t3code` and `@t3tools/*` packages.
  - Project origin: Forked from `pingdotgg/t3code` (T3 Code by t3.gg / Theo / Ping Labs).

- **Current Verification Command Status**:
  - `pnpm lint` (`vp lint --report-unused-disable-directives`): Fails with 1 warning and 3 errors in `apps/server/src/toolchain/ToolchainService.ts` and `apps/web/src/components/wiring/ToolchainSetup.tsx`.
  - `pnpm typecheck` (`vp run -r typecheck`): Fails due to 6 TypeScript errors in `apps/web/src/components/wiring/ToolchainSetup.tsx`.

## 2. Logic Chain

1. **Upstream Project Origin**:
   - `apps/server/package.json` explicitly declares `"url": "https://github.com/pingdotgg/t3code"`.
   - The monorepo layout, naming conventions (`@t3tools/*`, `t3`), and brand product name `"T3 Code (Alpha)"` confirm that this codebase is `T3 Code` (`pingdotgg/t3code`), created by the T3 Stack maintainers.

2. **Upstream Release Version**:
   - Every workspace package (`apps/web`, `apps/server`, `apps/desktop`, `packages/contracts`) consistently lists `"version": "0.0.33"`.
   - Therefore, the exact upstream release tag and baseline stack version used by this codebase is `pingdotgg/t3code@v0.0.33` (Release tag `v0.0.33`).

3. **Tracking Strategy in `package.json`**:
   - Requirement R2 specifies adding a comment directly inside `package.json` to track the upstream T3 version without breaking JSON syntax.
   - Per RFC 8259 (JSON Specification), standard JavaScript `//` line comments are non-standard JSON syntax and cause `JSON.parse()` syntax errors in strict JSON parsers.
   - However, top-level string key entries such as `"//"` and `"_comment"` (as well as dedicated object fields like `"t3"`) are 100% valid JSON keys that are ignored by package managers (`npm`, `pnpm`, `yarn`) and build tools (`vite`, `esbuild`, `oxlint`).
   - Using both `"//": "Upstream T3 Stack version: pingdotgg/t3code@v0.0.33 (https://github.com/pingdotgg/t3code)"` and a structured `"t3": { "upstreamVersion": "0.0.33", "upstreamRepo": "https://github.com/pingdotgg/t3code" }` block ensures both human readability and machine-parseable tracking without breaking JSON syntax or build tools.

## 3. Caveats

- **No `.ct3a-meta.json`**: This codebase is `t3code` (`pingdotgg/t3code`), which is an application monorepo produced by the T3 core team rather than a project initialized via the `create-t3-app` CLI generator tool. The version tracking therefore directly maps to `pingdotgg/t3code@v0.0.33`.
- **Existing Lint/Typecheck Failures**: Verification revealed existing failures in `apps/web/src/components/wiring/ToolchainSetup.tsx` and `apps/server/src/toolchain/ToolchainService.ts`, which should be resolved during frontend audit refactoring (R1).

## 4. Conclusion

- **Exact Upstream Version**: `pingdotgg/t3code@v0.0.33` (Release tag: `v0.0.33`).
- **Target Files for Upstream Tracking**:
  1. `c:\Users\rapid\Desktop\embedino workspace\t3-core\package.json` (Root package)
  2. `c:\Users\rapid\Desktop\embedino workspace\t3-core\apps\web\package.json` (Web app package)
- **Proposed JSON Patch Snippet**:
  ```json
  "//": "Upstream T3 Stack version: pingdotgg/t3code@v0.0.33 (https://github.com/pingdotgg/t3code)",
  "t3": {
    "upstreamVersion": "0.0.33",
    "upstreamRepo": "https://github.com/pingdotgg/t3code"
  }
  ```

## 5. Verification Method

To independently verify this report and any subsequent edits:

1. **JSON Syntax Verification**:

   ```bash
   node -e "JSON.parse(require('fs').readFileSync('package.json'))"
   node -e "JSON.parse(require('fs').readFileSync('apps/web/package.json'))"
   ```

   _Expected output_: Clean exit (code 0) without any JSON parsing errors.

2. **Package Manager Manifest Resolution**:

   ```bash
   pnpm install --lockfile-only
   ```

   _Expected output_: Locks dependencies without warnings or errors regarding invalid `package.json` fields.

3. **Workspace Build & Typecheck Verification**:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm build
   ```
