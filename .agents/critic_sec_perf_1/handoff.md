# Handoff Report — critic_sec_perf_1

**Audit Scope**: Security, Performance, Platform Portability, and Reliability Audit of Embedino Customizations  
**Date**: 2026-08-19  
**Handoff Type**: Hard Handoff (Task Complete)

---

## 1. Observation

Direct evidence gathered across the workspace:

1. **Terminal Command Injection**:
   In `apps/web/src/components/ChatView.tsx:3156-3197`:
   ```typescript
   const portArg = `"${device.port}"`;
   const fqbnArg = device.fqbn ? `-b "${device.fqbn}" ` : "";
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
   `device.fqbn` is interpolated without character validation or escaping.

2. **POSIX Shell Incompatibility**:
   In `apps/web/src/components/ChatView.tsx:3169, 3181`:
   ```typescript
   const arduinoBin = toolchainState.arduinoCliPath
     ? `& "${toolchainState.arduinoCliPath}"`
     : "arduino-cli";
   ...
   sketchDir = lastSlashIndex === -1 ? `"."` : `".\\${inoFileEntry.path.substring(0, lastSlashIndex).replace(/\//g, "\\")}"`;
   ```
   PowerShell call operator `& ` and Windows backslashes `.\\` are hardcoded, breaking execution in POSIX shells (`bash`, `zsh`) on macOS/Linux.

3. **PowerShell Polling CPU Overhead**:
   In `apps/server/src/hardware/DeviceService.ts:176-185, 271-275`:
   ```typescript
   if (platform === "win32") {
     timeout = setTimeout(doScan, 2000);
     timeout.unref();
   }
   ```
   `doScan()` triggers `execFileAsync("powershell.exe", ["-NoProfile", "-Command", "Get-CimInstance ..."])` every 2000ms.

4. **Synchronous Main-Thread Event Loop Blocking**:
   In `apps/server/src/toolchain/ToolchainService.ts:224, 286`:
   ```typescript
   NodeChildProcess.spawnSync(binaryPath, ["--version"], { timeout: 3000 });
   NodeChildProcess.spawnSync(binaryPath, ["version", "--format", "json"], { timeout: 3000 });
   ```
   Both calls execute synchronously on the Node.js event loop during `toolchainGetStatus`.

5. **Typecheck & Linter Run Results**:
   - `pnpm run tc`: Exited with code 0 (TypeScript passed across all 12 packages/apps).
   - `pnpm exec vp check`: Exited with code 0 (2,047 files formatted; 2 unrelated warnings in `apps/web/src/components/pullRequest/`).

---

## 2. Logic Chain

1. **From Observation 1**: Because `device.fqbn` and `device.port` originate from user associations or hardware descriptors and are concatenated directly into terminal input strings without regex validation or shell escaping, an attacker or malformed descriptor containing quotes (e.g. `uno" & calc.exe & echo "`) will escape the quotes and execute arbitrary shell commands inside the terminal pty (**Finding SEC-01: Critical**).
2. **From Observation 2**: Because POSIX shells (`bash`/`zsh`) treat `&` at the start of a command as a syntax error or background job operator, and treat backslashes `\` as literal filename characters rather than directory separators, any user running Embedino on macOS or Linux will experience hard failures when clicking "Flash to Board" with Arduino CLI (**Finding COMPAT-01: High**).
3. **From Observation 3**: Because `powershell.exe` requires 150–500ms of CPU time to bootstrap and parse CIM commands, executing it every 2 seconds consumes continuous CPU core capacity (10–25%), degrading performance and draining battery on Windows hosts (**Finding PERF-01: High**).
4. **From Observation 4**: Because `spawnSync` halts the Node.js JavaScript thread until the spawned child process returns or times out (up to 3000ms), calling `toolchainGetStatus` stalls all WebSocket RPC handling, client message routing, and terminal multiplexing (**Finding PERF-02: High**).

---

## 3. Caveats

- Hardware testing was performed through static code analysis, AST inspection, and runtime command validation on the Windows test environment; physical USB insertion was simulated via code trace analysis.
- Third-party binary vulnerabilities inside official `arduino-cli` and `platformio` distributions are outside the scope of this repository's codebase audit.

---

## 4. Conclusion

The audit identifies **1 Critical Security vulnerability (SEC-01)**, **3 High-severity platform/performance defects (COMPAT-01, PERF-01, PERF-02)**, and **6 Medium/Low reliability and code quality findings**.

**Verdict**: **REQUEST_CHANGES**  
The implementation is architecturally well-isolated under the 95/5 rule, but requires targeted remediation of terminal input escaping, platform-aware shell formatting, asynchronous toolchain detection, and optimized Windows device scanning before production deployment.

---

## 5. Verification Method

To independently verify these observations:

1. **Verify TypeScript & Linting Status**:
   ```bash
   pnpm run tc
   pnpm exec vp check
   ```
2. **Inspect Command Interpolation**:
   Open `apps/web/src/components/ChatView.tsx` lines 3156–3197 to verify raw string interpolation into `writeTerminal`.
3. **Inspect Polling & Synchronous Spawns**:
   - Open `apps/server/src/hardware/DeviceService.ts` lines 174–195 and 271–275.
   - Open `apps/server/src/toolchain/ToolchainService.ts` lines 224 and 286.
4. **Detailed Audit Report**:
   Read `.agents/critic_sec_perf_1/security_performance_bug_audit.md` for complete code references, reproduction vectors, and remediation steps.
