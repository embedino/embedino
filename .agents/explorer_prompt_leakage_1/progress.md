# Investigation Progress: Prompt & Hardware Context Leakage in Embedino Chat

- Last visited: 2026-08-19T09:05:00Z
- Status: Complete

## Tasks
- [x] 1. Identify workspace and upstream repository structure
- [x] 2. Investigate Prompt Assembly Pipeline (Hardware context injection, system prompt generation in `HardwareAgentPrompt.ts`)
- [x] 3. Investigate AI Completion / Stream Pipeline (Message formatting, message role assignment, stream generation in `CodexAdapter.ts`, `CodexSessionRuntime.ts`, `CursorAdapter.ts`, etc.)
- [x] 4. Investigate Chat UI & State (How messages are received, stored in state, filtered, rendered, and synced to external clients like ChatGPT Desktop)
- [x] 5. Compare with Upstream pingdotgg/t3code (Inspected `apps/server/src/provider/Layers/CodexAdapter.ts`, `CodexDeveloperInstructions.ts`)
- [x] 6. Root Cause Identification & Exact Remediation Diff (Generated full diffs for all affected adapters)
- [x] 7. Write final report and handoff (`prompt_leakage_investigation.md` and `handoff.md`)
