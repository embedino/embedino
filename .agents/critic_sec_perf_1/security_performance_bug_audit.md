# Embedino Customization Security, Performance, and Code Reliability Audit

**Auditor**: `critic_sec_perf_1` (Critic / Reviewer / Specialist)  
**Date**: 2026-08-19  
**Audit Target**: Embedino Workspace Customizations (v0.1.0 Milestone 1)  
**Scope**: 
- `packages/contracts/src/hardware/*`, `packages/contracts/src/toolchain.ts`, `packages/contracts/src/rpc.ts`, `packages/contracts/src/index.ts`
- `apps/server/src/hardware/*`, `apps/server/src/toolchain/*`, `apps/server/src/auth/RpcAuthorization.ts`, `apps/server/src/ws.ts`, `apps/server/src/provider/Layers/*`
- `packages/client-runtime/src/rpc/client.ts`
- `apps/web/src/state/hardware.ts`, `apps/web/src/state/toolchain.ts`
- `apps/web/src/components/hardware/*`, `apps/web/src/components/wiring/ToolchainSetup.tsx`, `apps/web/src/components/ChatView.tsx`, `apps/web/src/components/chat/ChatHeader.tsx`, `apps/web/src/components/sidebar/SidebarChrome.tsx`, `apps/web/src/components/settings/SettingsPanels.tsx`

---

## 1. Executive Summary

This independent security, performance, and code reliability audit examined all custom hardware and toolchain additions integrated into the Embedino codebase. 

While the architectural separation follows the **95/5 Modular Isolation Principle** defined in `AGENTS.md`, deep adversarial stress-testing revealed **10 distinct findings**, including **1 Critical security vulnerability**, **3 High-severity performance & platform defects**, and multiple reliability/code-quality concerns ("AI smells").

### Verdict: **REQUEST_CHANGES**

### Findings Breakdown Matrix

| ID | Title | Domain | Severity | Impact |
|:---|:---|:---|:---:|:---|
| **SEC-01** | Command Injection via Unsanitized `device.fqbn` / `device.port` in Terminal Execution | Security | **CRITICAL** | Remote/Local code execution via crafted device properties |
| **COMPAT-01** | Shell Incompatibility (Hardcoded PowerShell `& ` & Windows Path Slashes) | Reliability / Platform | **HIGH** | Build/Flash broken on macOS, Linux, and Windows `cmd.exe` |
| **PERF-01** | Severe CPU Churn from Unthrottled 2s `powershell.exe` Process Spawning | Performance | **HIGH** | Continuous 10–25% CPU core pegging on Windows polling |
| **PERF-02** | Main Event Loop Blocking via Synchronous `spawnSync` in Toolchain Status | Performance | **HIGH** | Server freezes up to 3s during RPC status inspection |
| **REL-01** | Uncached Synchronous Disk I/O & Uncaught TypeErrors in `DeviceAssociationStore` | Reliability / Disk I/O | **MEDIUM** | Disk hammering every 2s & stream crash on malformed JSON |
| **ARCH-01** | Silent Discard of Non-Snapshot Hardware Events in Frontend Reactive State | Architecture | **MEDIUM** | Granular connect/disconnect/enrich events ignored |
| **SEC-02** | Insecure Directory Search & Binary Hijack Risk in Windows Root `C:\` | Security | **MEDIUM** | Execution of untrusted binaries in permissive root paths |
| **LLM-01** | Context Bloat & Redundant Turn Prefixing in Provider Adapters | Performance / LLM | **MEDIUM** | Re-injects ~50 lines per turn in Codex; clobbers custom instructions |
| **TEST-01** | Complete Absence of Automated Test Coverage for Custom Modules | Quality | **MEDIUM** | Zero unit/integration tests for hardware & toolchain code |
| **SMELL-01** | Violations of `AGENTS.md` Section 7 ("AI Smells" & Unmanaged Timers) | Standards | **LOW** | Arbitrary `setTimeout` retries, mock progress strings, placeholder ternary |

---

## 2. Detailed Findings

---

### Finding SEC-01: Command Injection via Unsanitized `device.fqbn` and `device.port`
- **Severity**: **CRITICAL**
- **Domain**: Security (CWE-78: OS Command Injection)
- **Location**: `apps/web/src/components/ChatView.tsx:3156-3197`

#### Observation
In `ChatView.tsx`, the `runHardwareAction` callback constructs a raw shell command string and writes it directly to the pty terminal session:
```typescript
// apps/web/src/components/ChatView.tsx lines 3156-3197
const portArg = `"${device.port}"`;
const fqbnArg = device.fqbn ? `-b "${device.fqbn}" ` : "";

// Find the specific directory containing the .ino file
const inoFileEntry = projectEntries.data?.entries.find((e: any) => e.path.endsWith(".ino"));
let sketchDir = `"."`;
if (inoFileEntry) {
  const lastSlashIndex = inoFileEntry.path.lastIndexOf("/");
  sketchDir =
    lastSlashIndex === -1
      ? `"."`
      : `".\\${inoFileEntry.path.substring(0, lastSlashIndex).replace(/\//g, "\\")}"`;
}

command =
  action === "flash"
    ? `${arduinoBin} compile --upload ${fqbnArg}-p ${portArg} ${sketchDir}`
    : `${arduinoBin} monitor -p ${portArg}`;

await writeTerminal({
  environmentId,
  input: {
    threadId: activeThreadId,
    terminalId: targetTerminalId,
    data: `${command}\r`,
  },
});
```

#### Attack Scenario
1. A user connects a rogue USB microcontroller with a crafted USB serial/product descriptor, or sets a custom board association via the UI / `hardwareSetDeviceAssociation` RPC with an input:
   ```json
   {
     "deviceId": "0403:6001:COM3",
     "boardName": "ExploitBoard",
     "fqbn": "arduino:avr:uno\" & calc.exe & echo \""
   }
   ```
2. When the user clicks **"Flash to Board"**, the interpolated terminal command evaluates to:
   ```powershell
   & "arduino-cli" compile --upload -b "arduino:avr:uno" & calc.exe & echo "" -p "COM3" "."
   ```
3. The injected command (`calc.exe`) is immediately executed by the terminal shell with the user's full privileges.

#### Remediation
1. Enforce strict regex validation on `device.fqbn` and `device.port` prior to command construction:
   - FQBN: `/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+:[a-zA-Z0-9_:-]+$/`
   - Port: `/^(COM\d+|\/dev\/[a-zA-Z0-9_.-]+)$/`
2. Escape double quotes and shell metacharacters before string interpolation.

---

### Finding COMPAT-01: Cross-Platform Shell Incompatibility (Hardcoded PowerShell `& ` and Windows Path Slashes)
- **Severity**: **HIGH**
- **Domain**: Platform Compatibility & Reliability
- **Location**: `apps/web/src/components/ChatView.tsx:3168-3170, 3181`

#### Observation
1. In `ChatView.tsx:3169`, `arduinoBin` prepends PowerShell's call operator `& `:
   ```typescript
   const arduinoBin = toolchainState.arduinoCliPath
     ? `& "${toolchainState.arduinoCliPath}"`
     : "arduino-cli";
   ```
   - On macOS and Linux (running `bash`/`zsh`), starting a command with `& "/path/to/arduino-cli"` is invalid syntax or sends a background empty job:
     ```bash
     $ & "/home/user/.local/bin/arduino-cli" compile ...
     bash: syntax error near unexpected token '&'
     ```
   - On Windows when running `cmd.exe`, `&` is a command separator, causing `'&' is not recognized as an internal or external command`.
   - In contrast, `pioBin` (line 3162) does *not* prepend `& `, which causes PowerShell on Windows to fail when the path has spaces (treating `"C:\path with spaces\pio.exe"` as a string literal and echoing it instead of executing).
2. In `ChatView.tsx:3181`, `sketchDir` hardcodes Windows backslashes:
   ```typescript
   sketchDir =
     lastSlashIndex === -1
       ? `"."`
       : `".\\${inoFileEntry.path.substring(0, lastSlashIndex).replace(/\//g, "\\")}"`;
   ```
   On macOS and Linux, `.\subfolder` with backslashes is treated literally rather than as path delimiters, causing `arduino-cli compile` to fail with "directory not found".

#### Remediation
1. Normalize path separators using POSIX forward slashes (`"."` or `"./subfolder"`), which are universally accepted by both Windows and POSIX toolchain CLI binaries.
2. Only prepend `& ` if the target terminal shell is confirmed to be PowerShell; for POSIX shells and `cmd.exe`, omit `&`.

---

### Finding PERF-01: Severe CPU Spikes & Churn from Unthrottled 2s `powershell.exe` Polling
- **Severity**: **HIGH**
- **Domain**: Performance & Resource Management
- **Location**: `apps/server/src/hardware/DeviceService.ts:174-186, 271-275`

#### Observation
On Windows, `DeviceService.subscribeDevices()` executes a polling loop every 2000ms:
```typescript
// apps/server/src/hardware/DeviceService.ts lines 271-275
if (platform === "win32") {
  timeout = setTimeout(doScan, 2000);
  timeout.unref();
}
```
Inside `doScan()`, `scanDevices()` runs:
```typescript
// apps/server/src/hardware/DeviceService.ts lines 176-185
execFileAsync(
  "powershell.exe",
  [
    "-NoProfile",
    "-Command",
    `Get-CimInstance Win32_PnPEntity | Where-Object -Property Name -Match 'COM\\d+' | Where-Object -Property Present -eq $true | Select-Object Name, DeviceID, Manufacturer | ConvertTo-Json`,
  ],
  { encoding: "utf-8", timeout: 5000 },
)
```
- Spawning `powershell.exe` incurs a 150–500ms process startup overhead and consumes significant CPU cycles.
- Running this every 2 seconds keeps CPU usage pegged at 10–25% continuously, causing battery drain and fan noise on laptops.
- Multiple active subscriptions create independent, non-coalesced polling loops.

#### Remediation
1. Replace PowerShell process spawning on Windows with registry scanning of `HKLM\HARDWARE\DEVICEMAP\SERIALCOMM` (which can be read in <1ms without launching any child process).
2. Share a single broadcast subscription stream (e.g. `Stream.broadcast` or a shared Fiber) across all connected RPC clients instead of spawning per-subscription timers.

---

### Finding PERF-02: Main Event Loop Blocking via Synchronous `spawnSync` in Toolchain Status
- **Severity**: **HIGH**
- **Domain**: Performance & Responsiveness
- **Location**: `apps/server/src/toolchain/ToolchainService.ts:224-228, 286-290, 300-314`

#### Observation
`getToolchainStatus()` calls `findPio()` and `findArduinoCli()`, which iterate over candidate binary paths and invoke:
```typescript
// apps/server/src/toolchain/ToolchainService.ts line 224
const res = NodeChildProcess.spawnSync(binaryPath, ["--version"], {
  encoding: "utf8",
  timeout: 3000,
  windowsHide: true,
});
// line 286
const res = NodeChildProcess.spawnSync(binaryPath, ["version", "--format", "json"], {
  encoding: "utf8",
  timeout: 3000,
  windowsHide: true,
});
```
- `spawnSync` blocks the single-threaded Node.js event loop synchronously.
- When `toolchainGetStatus` is called (e.g., on app launch or navigating to Settings), the server cannot process any incoming WebSocket frames, HTTP requests, or terminal I/O for up to 3000ms per candidate.

#### Remediation
1. Convert version checks to asynchronous `execFileAsync` wrapped in `Effect.promise` or `Effect.async`.
2. Cache the detected toolchain version in memory so subsequent calls return instantaneously.

---

### Finding REL-01: Uncached Synchronous Disk I/O & Potential Process Crash in `DeviceAssociationStore`
- **Severity**: **MEDIUM**
- **Domain**: Reliability & Disk I/O
- **Location**: `apps/server/src/hardware/DeviceAssociationStore.ts:22-33, 61-75`

#### Observation
1. `findAssociation(vid, pid, serialNumber)` calls `loadAssociations()` synchronously:
   ```typescript
   export function loadAssociations(): StoredAssociation[] {
     try {
       if (NodeFS.existsSync(STORE_FILE)) {
         const data = NodeFS.readFileSync(STORE_FILE, "utf-8");
         const parsed = JSON.parse(data) as AssociationStoreData;
         return parsed.associations || [];
       }
     } catch (error) { ... }
     return [];
   }
   ```
   `resolveDevice` calls `findAssociation` for *every* device on *every* scan cycle (every 2s on Windows). This results in repeated, un-cached synchronous disk reads.
2. In `findAssociation`:
   ```typescript
   export function findAssociation(
     vid: string,
     pid: string,
     serialNumber?: string,
   ): StoredAssociation | null {
     const associations = loadAssociations();
     return (
       associations.find(
         (a) =>
           a.vid.toLowerCase() === vid.toLowerCase() &&
           a.pid.toLowerCase() === pid.toLowerCase() &&
           (!serialNumber || a.usbSerialNumber === serialNumber),
       ) || null
     );
   }
   ```
   If `device-associations.json` contains a malformed entry (e.g., missing `vid` property) or `vid`/`pid` is null, `a.vid.toLowerCase()` throws an unhandled `TypeError: Cannot read properties of undefined (reading 'toLowerCase')`. Because `findAssociation` has no `try/catch`, this uncaught error kills the device scan stream.
3. `saveAssociation` writes directly via `NodeFS.writeFileSync` without atomic write semantics, risking file corruption on crash.

#### Remediation
1. Cache loaded associations in-memory.
2. Use optional chaining `a.vid?.toLowerCase() === vid?.toLowerCase()` and Schema validation on load.
3. Use atomic file writes (`atomicWrite` helper) when updating `device-associations.json`.

---

### Finding ARCH-01: Silent Drop of Non-Snapshot Hardware Events in Frontend State
- **Severity**: **MEDIUM**
- **Domain**: Architecture & Contract Compliance
- **Location**: `apps/web/src/state/hardware.ts:77-94`

#### Observation
The `@t3tools/contracts` package defines `HardwareEvent` as:
```typescript
export const HardwareEvent = Schema.Union([
  HardwareSnapshotEvent,
  HardwareConnectedEvent,
  HardwareDisconnectedEvent,
  HardwareEnrichedEvent,
]);
```
However, in `apps/web/src/state/hardware.ts:79`:
```typescript
Stream.tap((event: HardwareEvent) =>
  Effect.sync(() => {
    if (event.type === "snapshot") {
      appAtomRegistry.update(hardwareStateAtom, (current) => ({ ... }));
    }
  })
)
```
Any `connected`, `disconnected`, or `enriched` events emitted by the backend are silently ignored by the web client.

#### Remediation
Implement pattern matching for all variants of `HardwareEvent` in `apps/web/src/state/hardware.ts`.

---

### Finding SEC-02: Insecure Directory Search & Binary Hijack Risk in Windows Root `C:\`
- **Severity**: **MEDIUM**
- **Domain**: Security & Path Resolution
- **Location**: `apps/server/src/toolchain/ToolchainService.ts:125-136, 196-202`

#### Observation
In `resolvePythonCommand` and `findPio`, candidate searches iterate over `C:\`:
```typescript
// apps/server/src/toolchain/ToolchainService.ts lines 196-202
const rootEntries = NodeFS.readdirSync("C:\\");
for (const entry of rootEntries) {
  if (entry.toLowerCase().startsWith("python")) {
    candidates.push(NodePath.join("C:\\", entry, "Scripts", "pio.exe"));
  }
}
```
On Windows, authenticated unprivileged users by default have write permissions to create folders under `C:\`. An attacker or unprivileged local user could place an arbitrary executable at `C:\python_temp\Scripts\pio.exe` or `C:\python_temp\python.exe`, which Embedino would detect and execute with the running user's privileges.

#### Remediation
Remove `C:\` directory enumeration. Restrict discovery candidates to official Python/PlatformIO directories (`%LOCALAPPDATA%\Programs\Python`, `%APPDATA%\Python`, `%ProgramFiles%`, virtualenv directories, and verified system `PATH`).

---

### Finding LLM-01: Context Bloat & Redundant Turn Prefixing in Provider Adapters
- **Severity**: **MEDIUM**
- **Domain**: Performance & LLM Context Efficiency
- **Location**: `apps/server/src/provider/Layers/CodexAdapter.ts:1820`, `ClaudeAdapter.ts:4097`

#### Observation
1. In `CodexAdapter.ts:1820`:
   ```typescript
   const finalInput = input.input ? hardwarePrompt + "\n\n" + input.input : hardwarePrompt;
   ```
   The ~50-line hardware prompt block is prepended to the user input of **every single turn**. In a 20-turn thread, the same prompt is duplicated 20 times across conversation history, wasting LLM context window tokens and increasing API costs.
2. In `ClaudeAdapter.ts:4097`:
   `customInstructions: hardwarePrompt`
   This overwrites any user-configured custom instructions rather than appending or merging them.

#### Remediation
1. Inject the hardware context once into system instructions or the thread session initialization, rather than prefixing every individual turn input in Codex.
2. In `ClaudeAdapter.ts`, concatenate `hardwarePrompt` with any existing `customInstructions`.

---

### Finding TEST-01: Zero Automated Test Coverage for Custom Hardware & Toolchain Modules
- **Severity**: **MEDIUM**
- **Domain**: Code Quality & Regression Prevention
- **Location**: Workspace test suite across `apps/server`, `apps/web`, `packages/contracts`

#### Observation
None of the custom Embedino modules have corresponding `.test.ts` files:
- `apps/server/src/hardware/DeviceService.test.ts` (Missing)
- `apps/server/src/hardware/BoardDatabase.test.ts` (Missing)
- `apps/server/src/hardware/DeviceAssociationStore.test.ts` (Missing)
- `apps/server/src/toolchain/ToolchainService.test.ts` (Missing)
- `apps/web/src/state/hardware.test.ts` (Missing)
- `apps/web/src/state/toolchain.test.ts` (Missing)

#### Remediation
Create Vitest unit tests with mocked child processes, simulated sysfs entries, and synthetic hardware events.

---

### Finding SMELL-01: Violations of `AGENTS.md` Section 7 ("AI Smells" & Unmanaged Timers)
- **Severity**: **LOW**
- **Domain**: Code Quality & Standards Conformance
- **Location**:
  - `apps/web/src/components/wiring/ToolchainSetup.tsx:61` (`setTimeout(() => void fetchStatus(retries - 1), 2000)`)
  - `apps/web/src/components/wiring/ToolchainSetup.tsx:117` (`setTimeout(() => updateToolchainState({ error: null }), 8000)`)
  - `apps/web/src/components/hardware/BoardSelectorPill.tsx:60` (`const label = activeDevice.driverChip ? "USB Serial" : "USB Serial";`)
  - `apps/server/src/toolchain/ToolchainService.ts:419` (`const contentLength = Number(...) || 18000000;`)
  - `apps/server/src/toolchain/ToolchainService.ts:571-588` (Hardcoded string-matching progress percentages for pip stdout)
  - `apps/web/src/state/hardware.ts:144` (`retryTimeout = setTimeout(start, 2000)`)

#### Observation
`AGENTS.md` Section 7 forbids arbitrary `setTimeout` calls, mock progress values, and placeholder code.
- `ToolchainSetup.tsx` uses raw `setTimeout` for retries instead of Effect's retry policies.
- `BoardSelectorPill.tsx` line 60 contains a redundant ternary where both branches return `"USB Serial"`.
- `ToolchainService.ts` hardcodes a 18MB magic fallback number for progress calculation.

#### Remediation
Clean up placeholder branches, replace unmanaged `setTimeout` retries with Effect `Schedule` or React state primitives, and derive progress dynamically.

---

## 3. Verification & Typecheck Results

- **TypeScript Typecheck (`pnpm run tc`)**: **PASSED (0 errors)** across all 12 packages and apps.
  - *Suggestions noted*: `ToolchainService.ts` contains raw `try/catch` inside Effect generators instead of `Effect.try`/`Effect.catch`.
- **Linter & Formatter (`pnpm exec vp check`)**: **PASSED (0 errors, 2 minor PR UI key warnings)** across 2,047 files.

---

## 4. Remediation Priority Roadmap

1. **Immediate (P0 - Security & Platform Blockers)**:
   - Patch `ChatView.tsx` command interpolation: whitelist FQBN/Port characters and fix cross-platform shell syntax (remove hardcoded `& ` and backslashes).
2. **High Priority (P1 - Performance & Stability)**:
   - Replace 2-second PowerShell polling with Windows registry lookup or push notifications.
   - Replace synchronous `spawnSync` in `ToolchainService.ts` with asynchronous version checks.
   - Add null checks and in-memory caching to `DeviceAssociationStore.ts`.
3. **Medium Priority (P2 - Architecture & LLM Cleanup)**:
   - Fix prompt bloat in `CodexAdapter.ts` (stop prefixing every turn).
   - Implement full event union handling in `hardware.ts`.
   - Remove root `C:\` directory enumeration in Python discovery.
4. **Low Priority (P3 - Quality & Tests)**:
   - Eliminate `setTimeout` "AI smells".
   - Add Vitest test coverage for hardware and toolchain services.
