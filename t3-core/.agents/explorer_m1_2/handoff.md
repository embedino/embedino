# Handoff Report: Settings UI & Server Toolchain Refactoring Strategy (M1-2)

**Working Directory**: `c:\Users\rapid\Desktop\embedino workspace\t3-core\.agents\explorer_m1_2`  
**Author**: M1 Settings & Server Explorer (Explorer M1-2)  
**Date**: 2026-08-12

---

## 1. Observation

### 1.1 Settings Select Control Display Locking (`SettingsPanels.tsx`)

- **Location**: `apps/web/src/components/settings/SettingsPanels.tsx`, Lines 1793–1826
- **Verbatim Code**:
  ```tsx
  1793:   const [activeToolchain, setActiveToolchain] = useActiveToolchain();
  1794:   const snap = useToolchainState();
  1795:   const [manageToolchainOpen, setManageToolchainOpen] = useState(false);
  ...
  1805:             <Select
  1806:               value={activeToolchain ?? "none"}
  1807:               onValueChange={(val) => {
  1808:                 if (val === "manage") {
  1809:                   setManageToolchainOpen(true);
  1810:                 } else if (val === "none") {
  1811:                   setActiveToolchain(null);
  1812:                 } else {
  1813:                   setActiveToolchain(val as "platformio" | "arduino");
  1814:                 }
  1815:               }}
  1816:             >
  1817:               <SelectTrigger aria-label="Active toolchain">
  1818:                 <SelectValue />
  1819:               </SelectTrigger>
  1820:               <SelectPopup alignItemWithTrigger={false}>
  1821:                 <SelectItem value="none">None (Not Selected)</SelectItem>
  1822:                 {snap.platformioInstalled && <SelectItem value="platformio">PlatformIO</SelectItem>}
  1823:                 {snap.arduinoInstalled && <SelectItem value="arduino">Arduino CLI</SelectItem>}
  1824:                 <SelectItem value="manage">Manage Toolchain...</SelectItem>
  1825:               </SelectPopup>
  1826:             </Select>
  ```
- **Observed Behavior**: Selecting `"Manage Toolchain..."` in the dropdown triggers `onValueChange` with `val === "manage"`, which calls `setManageToolchainOpen(true)`. However, `setActiveToolchain(...)` is intentionally not called, leaving `activeToolchain` state unchanged (e.g., `null`). Because the controlled `value` prop (`activeToolchain ?? "none"`) passed to `<Select>` does not change value across re-renders, Base UI (`@base-ui/react/select`) retains `"manage"` in its internal UI selection state, locking the display text in `<SelectValue />` to `"Manage Toolchain..."`.

### 1.2 ESLint Namespace Imports Violation (`ToolchainService.ts`)

- **Location**: `apps/server/src/toolchain/ToolchainService.ts`, Lines 5–7
- **Verbatim Code & Error**:
  ```ts
  5: import { spawn } from "node:child_process";
  6: import { existsSync } from "node:fs";
  7: import { join } from "node:path";
  ```
  ```text
  x t3code(namespace-node-imports): Import node:child_process as a namespace named NodeChildProcess.
  x t3code(namespace-node-imports): Import node:fs as a namespace named NodeFS.
  x t3code(namespace-node-imports): Import node:path as a namespace named NodePath.
  ```
- **Observed Failure**: Named Node built-in imports violate project ESLint rule `t3code(namespace-node-imports)`.

---

## 2. Logic Chain

1. **Settings Display Locking**:
   - In React controlled components using Base UI primitives (`@base-ui/react/select`), clicking an item in the popup updates the component's internal selection state.
   - When the user selects `"manage"`, `onValueChange` opens the modal but does not modify `activeToolchain`.
   - On the resulting re-render, React passes `value={activeToolchain ?? "none"}` to `<Select>`.
   - Because `value` prop is identical to the prior render's value (e.g. `"none"`), Base UI does not reset its internal selection state, leaving `<SelectValue />` rendering `"Manage Toolchain..."`.
   - **Fix**: Introduce a key state counter (`toolchainSelectKey`) incremented whenever `"manage"` is selected. Passing `key={toolchainSelectKey}` forces React to remount `<Select>` with `value={activeToolchain ?? "none"}`. Additionally, providing explicit children to `<SelectValue>` guarantees that the rendered text immediately matches `activeToolchain ?? "none"`.

2. **Server Toolchain ESLint Rule**:
   - The repository enforces `t3code(namespace-node-imports)`, requiring Node standard modules (`node:child_process`, `node:fs`, `node:path`) to be imported as namespace imports (`NodeChildProcess`, `NodeFS`, `NodePath`).
   - Replaced imports:
     - `import * as NodeChildProcess from "node:child_process";`
     - `import * as NodeFS from "node:fs";`
     - `import * as NodePath from "node:path";`
   - All references to `spawn`, `existsSync`, and `join` within `ToolchainService.ts` must be updated to their namespace equivalents (`NodeChildProcess.spawn`, `NodeFS.existsSync`, `NodePath.join`).

---

## 3. Caveats

- **State Dependency**: The `SettingsPanels.tsx` UI depends on `useToolchainState()` and `useActiveToolchain()` from `apps/web/src/state/toolchain.ts`. The state reset fix in `SettingsPanels.tsx` works independently of internal store implementation, but relies on `activeToolchain` being returned correctly.
- **Worker Execution Scope**: Explorer M1-2 is a read-only investigation role. The concrete code modifications detailed below must be applied by Worker M1-2.

---

## 4. Conclusion & Step-by-Step Replacement Plans for Worker

### Replacement Plan 1: `apps/web/src/components/settings/SettingsPanels.tsx`

**Target File**: `apps/web/src/components/settings/SettingsPanels.tsx`  
**Lines**: 1793–1826

**Existing Code**:

```tsx
  const [activeToolchain, setActiveToolchain] = useActiveToolchain();
  const snap = useToolchainState();
  const [manageToolchainOpen, setManageToolchainOpen] = useState(false);

  return (
    <SettingsPageContainer>
      <SettingsSection title="General">
        <SettingsRow
          id="build-toolchain"
          title="Active Build Toolchain"
          description="Select the engine used to compile and flash your embedded projects."
          control={
            <Select
              value={activeToolchain ?? "none"}
              onValueChange={(val) => {
                if (val === "manage") {
                  setManageToolchainOpen(true);
                } else if (val === "none") {
                  setActiveToolchain(null);
                } else {
                  setActiveToolchain(val as "platformio" | "arduino");
                }
              }}
            >
              <SelectTrigger aria-label="Active toolchain">
                <SelectValue />
              </SelectTrigger>
              <SelectPopup alignItemWithTrigger={false}>
                <SelectItem value="none">None (Not Selected)</SelectItem>
                {snap.platformioInstalled && <SelectItem value="platformio">PlatformIO</SelectItem>}
                {snap.arduinoInstalled && <SelectItem value="arduino">Arduino CLI</SelectItem>}
                <SelectItem value="manage">Manage Toolchain...</SelectItem>
              </SelectPopup>
            </Select>
          }
        />
```

**Replacement Code**:

```tsx
  const [activeToolchain, setActiveToolchain] = useActiveToolchain();
  const snap = useToolchainState();
  const [manageToolchainOpen, setManageToolchainOpen] = useState(false);
  const [toolchainSelectKey, setToolchainSelectKey] = useState(0);

  return (
    <SettingsPageContainer>
      <SettingsSection title="General">
        <SettingsRow
          id="build-toolchain"
          title="Active Build Toolchain"
          description="Select the engine used to compile and flash your embedded projects."
          control={
            <Select
              key={toolchainSelectKey}
              value={activeToolchain ?? "none"}
              onValueChange={(val) => {
                if (val === "manage") {
                  setManageToolchainOpen(true);
                  setToolchainSelectKey((k) => k + 1);
                } else if (val === "none") {
                  setActiveToolchain(null);
                } else {
                  setActiveToolchain(val as "platformio" | "arduino");
                }
              }}
            >
              <SelectTrigger aria-label="Active toolchain">
                <SelectValue>
                  {activeToolchain === "platformio"
                    ? "PlatformIO"
                    : activeToolchain === "arduino"
                    ? "Arduino CLI"
                    : "None (Not Selected)"}
                </SelectValue>
              </SelectTrigger>
              <SelectPopup alignItemWithTrigger={false}>
                <SelectItem value="none">None (Not Selected)</SelectItem>
                {snap.platformioInstalled && <SelectItem value="platformio">PlatformIO</SelectItem>}
                {snap.arduinoInstalled && <SelectItem value="arduino">Arduino CLI</SelectItem>}
                <SelectItem value="manage">Manage Toolchain...</SelectItem>
              </SelectPopup>
            </Select>
          }
        />
```

---

### Replacement Plan 2: `apps/server/src/toolchain/ToolchainService.ts`

**Target File**: `apps/server/src/toolchain/ToolchainService.ts`  
**Lines**: 5–7 and body references

**Step 1: Replace Import Statements (Lines 5–7)**

**Existing Code**:

```ts
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
```

**Replacement Code**:

```ts
import * as NodeChildProcess from "node:child_process";
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";
```

**Step 2: Update Function References in File Body**

1. Replace `join(` with `NodePath.join(` at lines 20–24, 29–32, 37, 59–61, 63.
2. Replace `existsSync(` with `NodeFS.existsSync(` at lines 43, 68.
3. Replace `spawn(` with `NodeChildProcess.spawn(` at line 140.

**Full Updated File Content for `apps/server/src/toolchain/ToolchainService.ts`**:

```ts
import {
  ToolchainInstallProgressEvent,
  ToolchainInstallError,
  ToolchainStatus,
} from "@t3tools/contracts";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Queue from "effect/Queue";
import * as NodeChildProcess from "node:child_process";
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";

// ---------------------------------------------------------------------------
// Detect installed toolchains — instant filesystem checks, zero process spawning
// ---------------------------------------------------------------------------

function findPio(): { installed: boolean; version: string | null } {
  const appData = process.env.APPDATA || "";
  const localAppData = process.env.LOCALAPPDATA || "";
  const userProfile = process.env.USERPROFILE || "";

  // Check known pip user-script install locations (Windows)
  const pipPaths = [
    NodePath.join(appData, "Python", "Python314", "Scripts", "pio.exe"),
    NodePath.join(appData, "Python", "Python313", "Scripts", "pio.exe"),
    NodePath.join(appData, "Python", "Python312", "Scripts", "pio.exe"),
    NodePath.join(appData, "Python", "Python311", "Scripts", "pio.exe"),
    NodePath.join(appData, "Python", "Python310", "Scripts", "pio.exe"),
  ];

  // Also check global Python Scripts, venv, and PATH-adjacent locations
  const globalPaths = [
    NodePath.join(userProfile, ".platformio", "penv", "Scripts", "pio.exe"),
    NodePath.join(localAppData, "Programs", "Python", "Python314", "Scripts", "pio.exe"),
    NodePath.join(localAppData, "Programs", "Python", "Python313", "Scripts", "pio.exe"),
    NodePath.join(localAppData, "Programs", "Python", "Python312", "Scripts", "pio.exe"),
  ];

  // Check PATH entries
  const pathDirs = (process.env.PATH || "").split(";");
  const pathPioPaths = pathDirs.map((dir) => NodePath.join(dir, "pio.exe"));

  const allCandidates = [...pipPaths, ...globalPaths, ...pathPioPaths];

  for (const candidate of allCandidates) {
    try {
      if (NodeFS.existsSync(candidate)) {
        return { installed: true, version: `PlatformIO (${candidate})` };
      }
    } catch {
      // ignore permission errors
    }
  }

  return { installed: false, version: null };
}

function findArduinoCli(): { installed: boolean; version: string | null } {
  const localAppData = process.env.LOCALAPPDATA || "";
  const userProfile = process.env.USERPROFILE || "";

  const candidates = [
    NodePath.join(localAppData, "Arduino15", "arduino-cli.exe"),
    NodePath.join(userProfile, "bin", "arduino-cli.exe"),
    NodePath.join(userProfile, ".arduino", "arduino-cli.exe"),
    // Check PATH
    ...(process.env.PATH || "").split(";").map((dir) => NodePath.join(dir, "arduino-cli.exe")),
  ];

  for (const candidate of candidates) {
    try {
      if (NodeFS.existsSync(candidate)) {
        return { installed: true, version: `Arduino CLI (${candidate})` };
      }
    } catch {
      // ignore
    }
  }

  return { installed: false, version: null };
}

export const getToolchainStatus = (): Effect.Effect<ToolchainStatus, ToolchainInstallError> => {
  return Effect.try({
    try: () => {
      const pio = findPio();
      const arduino = findArduinoCli();

      return {
        platformioInstalled: pio.installed,
        platformioVersion: pio.version,
        arduinoInstalled: arduino.installed,
        arduinoVersion: arduino.version,
      } satisfies ToolchainStatus;
    },
    catch: (e) => new ToolchainInstallError({ message: `Status check failed: ${e}` }),
  });
};

// ---------------------------------------------------------------------------
// Install toolchain — streams real progress events from pip / powershell
// ---------------------------------------------------------------------------

const installToolchainInternal = (
  toolchain: "platformio" | "arduino",
): Stream.Stream<ToolchainInstallProgressEvent, ToolchainInstallError> => {
  return Stream.callback<ToolchainInstallProgressEvent, ToolchainInstallError>((queue) => {
    let command: string;
    let args: string[];

    if (toolchain === "platformio") {
      command = "python";
      args = ["-u", "-m", "pip", "install", "platformio"];
    } else if (toolchain === "arduino") {
      command = "powershell";
      args = [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $url = 'https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip'; $out = Join-Path $env:TEMP 'arduino-cli.zip'; $dest = Join-Path $env:USERPROFILE 'bin'; Write-Host 'Downloading Arduino CLI...'; New-Item -ItemType Directory -Force -Path $dest | Out-Null; Invoke-WebRequest -Uri $url -OutFile $out; Write-Host 'Extracting Arduino CLI...'; Expand-Archive -Path $out -DestinationPath $dest -Force; Write-Host 'Installation completed successfully.'",
      ];
    } else {
      return Queue.fail(
        queue,
        new ToolchainInstallError({ message: "Unknown toolchain type" }),
      ).pipe(Effect.asVoid);
    }

    const parseProgress = (text: string, current: number): number => {
      const lower = text.toLowerCase();
      if (toolchain === "platformio") {
        if (lower.includes("requirement already satisfied")) return Math.max(current, 90);
        if (lower.includes("collecting")) return Math.max(current, 15);
        if (lower.includes("downloading") || lower.includes("using cached"))
          return Math.max(current, 40);
        if (lower.includes("installing collected") || lower.includes("uninstalling"))
          return Math.max(current, 70);
        if (lower.includes("successfully installed")) return 95;
      } else {
        if (lower.includes("downloading")) return Math.max(current, 25);
        if (lower.includes("unpacking") || lower.includes("extracting"))
          return Math.max(current, 60);
        if (lower.includes("installing") || lower.includes("copying")) return Math.max(current, 85);
      }
      return current;
    };

    return Effect.callback<void, ToolchainInstallError>((resume) => {
      let currentProgress = 0;

      try {
        const child = NodeChildProcess.spawn(command, args, { shell: true, windowsHide: true });

        Effect.runFork(
          Queue.offer(queue, {
            type: "progress" as const,
            progress: 0,
            stdout: `Starting ${toolchain} installation...\n`,
          }),
        );

        // Smooth progress ticker
        const ticker = setInterval(() => {
          if (currentProgress < 95) {
            currentProgress += 1;
            Effect.runFork(
              Queue.offer(queue, { type: "progress" as const, progress: currentProgress }),
            );
          }
        }, 300);

        child.stdout?.on("data", (data: Buffer) => {
          const text = data.toString();
          currentProgress = parseProgress(text, currentProgress);
          Effect.runFork(
            Queue.offer(queue, {
              type: "progress" as const,
              progress: currentProgress,
              stdout: text,
            }),
          );
        });

        child.stderr?.on("data", (data: Buffer) => {
          const text = data.toString();
          currentProgress = parseProgress(text, currentProgress);
          Effect.runFork(
            Queue.offer(queue, {
              type: "progress" as const,
              progress: currentProgress,
              stdout: text,
            }),
          );
        });

        child.on("error", (error) => {
          clearInterval(ticker);
          resume(
            Effect.fail(new ToolchainInstallError({ message: `Process error: ${error.message}` })),
          );
        });

        child.on("close", (code) => {
          clearInterval(ticker);
          if (code === 0) {
            Effect.runFork(
              Queue.offer(queue, {
                type: "progress" as const,
                progress: 100,
                stdout: "Installation completed successfully.",
              }).pipe(Effect.andThen(Queue.end(queue))),
            );
            resume(Effect.void);
          } else {
            resume(
              Effect.fail(
                new ToolchainInstallError({ message: `Process exited with code ${code}` }),
              ),
            );
          }
        });
      } catch (e: any) {
        resume(Effect.fail(new ToolchainInstallError({ message: `Spawn failed: ${e.message}` })));
      }
    }).pipe(Effect.forkScoped, Effect.asVoid);
  });
};

export const installToolchainPlatformio = () => installToolchainInternal("platformio");
export const installToolchainArduino = () => installToolchainInternal("arduino");
```

---

## 5. Verification Method

1. **Linting Check**:

   ```bash
   pnpm lint
   ```

   _Expected Result_: Zero `t3code(namespace-node-imports)` errors from `ToolchainService.ts`.

2. **TypeScript Compilation Check**:

   ```bash
   pnpm typecheck
   ```

   _Expected Result_: 0 errors in both `@t3tools/web` and `@t3tools/server`.

3. **UI Verification**:
   - Navigate to Settings -> General panel.
   - Click "Active Build Toolchain" dropdown -> select "Manage Toolchain...".
   - Confirm that the modal opens and the dropdown trigger display text reverts to `"None (Not Selected)"` (or active toolchain label) instead of remaining locked on `"Manage Toolchain..."`.
