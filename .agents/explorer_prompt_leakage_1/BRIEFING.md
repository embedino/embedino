# BRIEFING — 2026-08-19T09:05:00Z

## Mission
Investigate CRITICAL BUG: System Prompt & Hardware Context Leakage in Embedino Chat.

## 🔒 My Identity
- Archetype: Explorer
- Roles: Read-only investigation, prompt assembly & AI stream pipeline analysis, synthesis
- Working directory: c:\Users\rapid\Desktop\embedino workspace\.agents\explorer_prompt_leakage_1
- Original parent: 7d128aee-7012-44e9-8636-c1a60687e301
- Milestone: Investigation of Prompt Leakage

## 🔒 Key Constraints
- Read-only investigation — do NOT implement in source code
- Adhere to 95/5 Modular Isolation Principle and Regraft rules in recommendations
- Write reports to .agents/explorer_prompt_leakage_1/
- Communicate back to parent via send_message

## Current Parent
- Conversation ID: 7d128aee-7012-44e9-8636-c1a60687e301
- Updated: 2026-08-19T09:05:00Z

## Investigation State
- **Explored paths**: `apps/server/src/hardware/HardwareAgentPrompt.ts`, `apps/server/src/provider/Layers/CodexAdapter.ts`, `apps/server/src/provider/Layers/CodexSessionRuntime.ts`, `apps/server/src/provider/CodexDeveloperInstructions.ts`, `apps/server/src/provider/Layers/ClaudeAdapter.ts`, `apps/server/src/provider/Layers/CursorAdapter.ts`, `apps/server/src/provider/Layers/GrokAdapter.ts`, `apps/server/src/provider/Layers/OpenCodeAdapter.ts`, `apps/web/src/components/ChatView.tsx`, `apps/server/src/orchestration/decider.ts`, `apps/server/src/orchestration/Layers/ProviderCommandReactor.ts`, upstream `pingdotgg/t3code`
- **Key findings**: Root cause is string concatenation of `hardwarePrompt` to `input.input` (user prompt) in `CodexAdapter.ts:1820`, `CursorAdapter.ts:970`, `GrokAdapter.ts:959`, and `OpenCodeAdapter.ts:1446`. In Codex, this turns the hardware prompt into a `UserInput` turn item, causing ChatGPT Desktop/Web App to display it in the user's message bubble and set the thread title to `[EMBEDINO HARDWARE CONTEXT]`.
- **Unexplored areas**: None. Full investigation complete.

## Key Decisions Made
- Reconciled upstream mechanism: pass hardware prompt via `collaboration_mode.settings.developer_instructions` in Codex and clean `input.input` in all adapters.

## Artifact Index
- DISPATCH.md — Initial dispatch prompt and parent update
- progress.md — Real-time investigation progress
- prompt_leakage_investigation.md — Detailed analysis report
- handoff.md — Standardized 5-component handoff report
