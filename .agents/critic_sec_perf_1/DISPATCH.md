## 2026-08-19T08:58:12Z
<USER_REQUEST>
You are Critic `critic_sec_perf_1` conducting a Security, Performance, and Code Reliability Audit of all Embedino customizations.

Your assigned working directory is: `c:\Users\rapid\Desktop\embedino workspace\.agents\critic_sec_perf_1`
Please create this directory, your `progress.md`, and your final report `security_performance_bug_audit.md` + `handoff.md`.

Relevant inputs:
- Embedino workspace: `c:\Users\rapid\Desktop\embedino workspace`
- `AGENTS.md`: `c:\Users\rapid\Desktop\embedino workspace\AGENTS.md` (specifically Section 6 & 7: Code Quality & Standards)
- Custom code paths:
  - `packages/contracts/src/hardware/*`, `packages/contracts/src/toolchain.ts`
  - `apps/server/src/hardware/*`, `apps/server/src/toolchain/*`, `apps/server/src/auth/RpcAuthorization.ts`, `apps/server/src/ws.ts`
  - `apps/web/src/state/hardware.ts`, `apps/web/src/state/toolchain.ts`
  - `apps/web/src/components/hardware/*`, `apps/web/src/components/wiring/ToolchainSetup.tsx`

Audit directives:
1. Security Audit:
   - RPC endpoint authentication/authorization in `RpcAuthorization.ts` and `ws.ts`. Are hardware and toolchain endpoints properly guarded?
   - Input sanitization, path traversal risks in device associations or toolchain binary discovery.
   - Process execution safety: Does toolchain detection avoid arbitrary command execution?
2. Performance & Resource Audit:
   - Polling and event streams: How are serial ports and devices polled? Any CPU spinning or unthrottled loops?
   - Memory management: Are WebSocket subscriptions and Effect stream listeners cleaned up on unmount or disconnect?
   - Filesystem I/O: Are toolchain binary searches efficient (e.g. cached, non-blocking)?
3. Reliability & Bug Hunt:
   - Error handling: Are Effect schemas and tagged error classes (`Schema.TaggedErrorClass`) properly handled in UI and server?
   - Edge cases: Disconnected ports, invalid baud rates, unknown VID/PIDs, missing toolchains, platform-specific path separators (Windows `\` vs POSIX `/`).
   - "AI Smells" check per `AGENTS.md` Section 7: Flag any arbitrary `setTimeout`, mock data in production paths, missing error handlers, or bypasses.
4. Categorize findings by severity (Critical / High / Medium / Low / Info) with code references, reproduction vectors, and remediation steps.
5. Write your comprehensive report to `c:\Users\rapid\Desktop\embedino workspace\.agents\critic_sec_perf_1\security_performance_bug_audit.md` and complete your `handoff.md`. Send completion message back to parent.
</USER_REQUEST>
