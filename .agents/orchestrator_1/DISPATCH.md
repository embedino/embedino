## 2026-08-19T08:57:25Z
You are the Project Orchestrator for Embedino vs upstream t3code diff, rationale, and architecture/quality audit.

Your working directory is: `c:\Users\rapid\Desktop\embedino workspace\.agents\orchestrator_1`
The authoritative user request is in: `c:\Users\rapid\Desktop\embedino workspace\.agents\ORIGINAL_REQUEST.md`
The Embedino workspace root is: `c:\Users\rapid\Desktop\embedino workspace`
The target upstream clone directory: `c:\Users\rapid\Desktop\t3code-official`

Please fulfill all user requirements:
1. Setup and Diffing: Clone `pingdotgg/t3code` upstream into `c:\Users\rapid\Desktop\t3code-official` (or sibling directory), identify all modified, added, and deleted files relative to upstream base.
2. Deep-Dive Rationale Analysis: Document the reason behind each change, evaluating how it supports Embedino's specific goals as an embedded systems IDE.
3. Full Quality and Architecture Audit: Audit code quality, performance, security, and strict adherence to the "95/5 Modular Isolation Principle" defined in `AGENTS.md`. Flag modifications touching upstream files outside approved "thin docking ports". Identify potential bugs, security issues, performance regressions.
4. Comprehensive Reporting: Produce a single comprehensive Markdown report documenting all findings. Have an independent agent judge review the report against Embedino `AGENTS.md` guidelines.

You are requested to deploy a substantial team of specialists (explorers, diff analysts, rationale analysts, security/architecture auditors, synthesis & judge agents) to handle these tasks thoroughly in parallel.

Maintain your `BRIEFING.md` and `progress.md` in your working directory. When complete, send your completion report to the Sentinel.

## 2026-08-19T08:59:03Z
Update on user requirements from parent/user:
The user has clarified the primary motivation for this audit: In the Embedino workspace, the "hardware Embedino agent" is leaking its full system prompt and hardware context directly into the user-facing chat responses. The official upstream t3code handles this correctly and does not show the system prompt in the chat.

Please ensure the team specifically investigates the chat UI, AI completion logic, and prompt assembly pipelines to identify why this context leakage is occurring in Embedino, and include the root cause and recommended fix in the final report. This update has been recorded in ORIGINAL_REQUEST.md.

## 2026-08-19T09:01:51Z
CRITICAL UPDATE on the system prompt leakage issue:
The user clarified: "This is not happening in the T3 app. This is happening on the ChatGPT app because we are using those as a provider"

This means the UI leakage is NOT in the Embedino web UI. Embedino is either acting as an MCP server, or generating a clipboard/file payload, or integrating with the ChatGPT Desktop App (or similar external provider), and the `hardwarePrompt` is being injected in a way that causes the ChatGPT app to treat it as the first message (which is why the chat title becomes "[EMBEDINO HARDWARE CONTEXT]").

Please redirect the prompt leakage investigation to examine how Embedino exports its context to external providers (e.g., check `apps/server/src/mcp`, or the specific Provider Adapters like `OpenCodeAdapter` or `CodexAdapter` if they interface with external apps). Find where `buildHardwareSystemPrompt` output is sent to these external clients and why it's structured in a way that leaks into their chat history.

This has been recorded in ORIGINAL_REQUEST.md.

## 2026-08-19T09:04:24Z
CRITICAL CORRECTION on the System Prompt / Hardware Context Leakage:
The user clarified that the issue happens across ANY provider (Claude, Cursor, Codex, etc.) connected to the Embedino workspace.

The core bugs to investigate:
1. Redundancy: Embedino is injecting `[EMBEDINO HARDWARE CONTEXT]` on *every single message/turn*, whereas official t3code only sends its system prompt *once* per session.
2. Visibility: The hardware context is being injected in a way that makes it *visible* in the chat UI of the provider app (e.g. shows up as a chat bubble or chat title). The official t3code system prompt is completely hidden from the chat UI.

The audit team MUST investigate the prompt assembly pipeline (e.g., `HardwareAgentPrompt.ts` and its usage in `CodexAdapter.ts`, `ClaudeAdapter.ts`, etc.) across all provider adapters to understand why Embedino hardware context bypasses standard hidden system prompt mechanisms and attaches to every turn. The fix must restore official T3 code behavior: send once at session init, and keep hidden.

This has been recorded in ORIGINAL_REQUEST.md.
