# Original User Request

## 2026-08-19T08:56:53Z

Clone the official `pingdotgg/t3code` repository into a separate directory and compare it against the local `Embedino` workspace. Generate a single comprehensive report detailing all file changes, the rationale behind them, and a full deep-dive audit (code quality, performance, security, and architectural drift). Use a very large team of agents.

Working directory: `c:\Users\rapid\Desktop\t3code-official` (or let the team decide an appropriate sibling directory)
Integrity mode: development

## Requirements

### R1. Setup and Diffing
Clone the upstream `pingdotgg/t3code` repository into a separate folder. Generate a comprehensive mapping of all modified, added, and deleted files in the Embedino workspace relative to the upstream base.

### R2. Deep-Dive Rationale Analysis
Analyze the reason behind each change, evaluating how it supports Embedino's specific goals as an embedded systems IDE. 

### R3. Full Quality and Architecture Audit
Audit the changes for code quality, performance, security, and strict adherence to the "95/5 Modular Isolation Principle" defined in `AGENTS.md`. Identify potential merge conflict risks, architectural flaws, or regressions.

### R4. Comprehensive Reporting
Produce a single, comprehensive Markdown report documenting all findings from the diffing, rationale analysis, and audit phases.

## Acceptance Criteria

### Setup and Diffing
- [ ] The upstream repo is cloned into a separate local directory.
- [ ] Every file that differs between the two workspaces is identified (programmatically verifiable).

### Deep-Dive Rationale Analysis
- [ ] Each major modification or addition includes a documented rationale explaining *why* the user/agent made it.

### Full Quality and Architecture Audit
- [ ] The report explicitly flags any Embedino modifications that touch upstream files outside the approved "thin docking ports" (as defined in `AGENTS.md`).
- [ ] The report includes a section identifying potential bugs, security issues, or performance regressions introduced by the custom code.

### Comprehensive Reporting
- [ ] A single Markdown file is generated containing all analysis and audit results.
- [ ] An independent agent judge reviews the report against the Embedino `AGENTS.md` guidelines and confirms that the analysis is not superficial and covers all major diffs.

## Follow-up — 2026-08-19T08:58:52Z

Update on user requirements: The user has clarified the primary motivation for this audit. In the Embedino workspace, the "hardware Embedino agent" is leaking its full system prompt and hardware context directly into the user-facing chat responses. The official upstream t3code handles this correctly and does not show the system prompt in the chat.

Please ensure the audit specifically investigates the chat UI, AI completion logic, and prompt assembly pipelines to identify why this context leakage is occurring in Embedino, and include the root cause and recommended fix in the final report.

## Follow-up — 2026-08-19T09:01:30Z

CRITICAL UPDATE on the system prompt leakage issue:
The user clarified: "This is not happening in the T3 app. This is happening on the ChatGPT app because we are using those as a provider"

This means the UI leakage is NOT in the Embedino web UI. Embedino is either acting as an MCP server, or generating a clipboard/file payload, or integrating with the ChatGPT Desktop App (or similar external provider), and the `hardwarePrompt` is being injected in a way that causes the ChatGPT app to treat it as the first message (which is why the chat title becomes "[EMBEDINO HARDWARE CONTEXT]").

Please redirect the audit to investigate how Embedino exports its context to external providers (e.g., check `apps/server/src/mcp`, or the specific Provider Adapters like `OpenCodeAdapter` or `CodexAdapter` if they interface with external apps). Find where `buildHardwareSystemPrompt` output is sent to these external clients and why it's structured in a way that leaks into their chat history.

## Follow-up — 2026-08-19T09:04:13Z

CRITICAL CORRECTION regarding the System Prompt Leakage:
The user has clarified that the issue is NOT specific to ChatGPT. It happens across ANY provider (Claude, Cursor, Codex, etc.) connected to the Embedino workspace. 

The core bugs they are reporting are:
1. Redundancy: Embedino is injecting the `[EMBEDINO HARDWARE CONTEXT]` on *every single message/turn*, whereas official t3code only sends its system prompt *once* per session.
2. Visibility: The hardware context is being injected in a way that makes it *visible* in the chat UI of the provider app (e.g. it shows up as a chat bubble or title). The official t3code system prompt is completely hidden from the chat UI.

The audit team MUST investigate the prompt assembly pipeline (e.g., `HardwareAgentPrompt.ts` and its usage in `CodexAdapter.ts`, `ClaudeAdapter.ts`, etc.) to understand why the Embedino hardware context is bypassing the standard hidden system prompt mechanism and why it is being attached to every single turn instead of just the session initialization. The fix must restore the official T3 code behavior: send once, and keep hidden.
