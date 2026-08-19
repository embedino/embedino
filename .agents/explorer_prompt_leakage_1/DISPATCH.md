## 2026-08-19T08:59:22Z
You are Explorer `explorer_prompt_leakage_1` investigating the CRITICAL BUG: System Prompt & Hardware Context Leakage in Embedino Chat.

Your assigned working directory is: `c:\Users\rapid\Desktop\embedino workspace\.agents\explorer_prompt_leakage_1`
Please create this directory, your `progress.md`, and your final report `prompt_leakage_investigation.md` + `handoff.md`.

## 2026-08-19T09:02:00Z
**Context**: AI Prompt Leakage Investigation
**Content**: CRITICAL UPDATE FROM USER/PARENT:
The user clarified: "This is not happening in the T3 app. This is happening on the ChatGPT app because we are using those as a provider"
This means the UI leakage is NOT in the Embedino web UI. Embedino is either acting as an MCP server, or generating a clipboard/file payload, or integrating with the ChatGPT Desktop App (or external OpenAI / Codex / OpenCode provider adapters), and the `hardwarePrompt` is being injected in a way that causes the ChatGPT app to treat it as the first user message (which is why the chat title becomes "[EMBEDINO HARDWARE CONTEXT]").

Please redirect your prompt leakage investigation to examine how Embedino exports its context to external providers (e.g. check `apps/server/src/mcp`, `apps/server/src/provider/`, Provider Adapters like `OpenCodeAdapter`, `CodexAdapter`, `ClaudeAdapter`, or MCP servers). Find where `buildHardwareSystemPrompt` / `hardwarePrompt` output is sent to external clients and why it's structured in a way that leaks into their chat history/turns as user messages instead of true system instructions.
**Action**: Investigate these external provider adapters and MCP/payload exports, identify the root cause, and provide the exact fix in `prompt_leakage_investigation.md`.

## 2026-08-19T09:05:00Z
**Context**: System Prompt & Hardware Context Leakage Across Providers
**Content**: CRITICAL CLARIFICATION FROM USER/PARENT:
The user clarified that the issue happens across ANY provider (Claude, Cursor, Codex, OpenCode, Grok, etc.) connected to the Embedino workspace.

The core bugs to investigate:
1. **Redundancy**: Embedino is injecting `[EMBEDINO HARDWARE CONTEXT]` on *every single message/turn*, whereas official upstream t3code only sends its system prompt *once* per session (at session initialization).
2. **Visibility**: The hardware context is being injected in a way that makes it *visible* in the chat UI of the provider app (e.g. shows up as a chat bubble or sets the chat title to `[EMBEDINO HARDWARE CONTEXT]`). The official t3code system prompt is completely hidden from the chat UI.

Inspect all provider adapters (`CodexAdapter.ts`, `ClaudeAdapter.ts`, `CursorAdapter.ts`, `GrokAdapter.ts`, `OpenCodeAdapter.ts`) and `HardwareAgentPrompt.ts`.
Compare with upstream t3code's system prompt handling:
- How does upstream t3code initialize system instructions once per session?
- Why is Embedino appending `hardwarePrompt` to user turns or turn inputs instead of session system instructions?
- How to fix it so hardware context is sent once at session init (or as hidden system prompt) and stays completely hidden from the chat history.

**Action**: Produce the root cause analysis and exact code diff remediation in `prompt_leakage_investigation.md` and `handoff.md`.

