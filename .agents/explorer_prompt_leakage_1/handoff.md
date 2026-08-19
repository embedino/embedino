# Handoff Report: System Prompt & Hardware Context Leakage Across Providers

- **Agent**: `explorer_prompt_leakage_1`
- **Working Directory**: `c:\Users\rapid\Desktop\embedino workspace\.agents\explorer_prompt_leakage_1`
- **Type**: Hard Handoff (Investigation Complete)

---

## 1. Observation

### Obs 1: Multi-Provider `input.input` Concatenation
Direct concatenation of `hardwarePrompt` into user-facing turn input was identified in 4 provider adapters:
1. `apps/server/src/provider/Layers/CodexAdapter.ts:1820`: `finalInput = input.input ? hardwarePrompt + "\n\n" + input.input : hardwarePrompt; return yield* session.runtime.sendTurn({ input: finalInput, ... });`
2. `apps/server/src/provider/Layers/CursorAdapter.ts:970`: `finalPromptText = rawText ? hardwarePrompt + "\n\n" + rawText : hardwarePrompt; promptParts.push({ type: "text", text: finalPromptText });`
3. `apps/server/src/provider/Layers/GrokAdapter.ts:959`: `const text = rawText ? hardwarePrompt + "\n\n" + rawText : hardwarePrompt;`
4. `apps/server/src/provider/Layers/OpenCodeAdapter.ts:1446`: `const text = rawText ? hardwarePrompt + "\n\n" + rawText : hardwarePrompt;`

### Obs 2: Codex Session Runtime Wraps `prompt` into `UserInput`
In `apps/server/src/provider/Layers/CodexSessionRuntime.ts:377–383`:
```typescript
  const turnInput: Array<EffectCodexSchema.V2TurnStartParams__UserInput> = [];
  if (input.prompt) {
    turnInput.push({
      type: "text",
      text: input.prompt,
    });
  }
```
In the OpenAI Codex protocol, `turnInput` represents the **User Role** message.

### Obs 3: Upstream `t3code` Keeps `input.input` Pure & Uses `developer_instructions`
In `c:\Users\rapid\Desktop\t3code-official\apps\server\src\provider\Layers\CodexAdapter.ts:1819–1821`:
- Upstream passes `input: input.input` strictly unmodified.
- Upstream passes system instructions through `collaboration_mode.settings.developer_instructions` (`CodexDeveloperInstructions.ts:169`), which OpenAI/ChatGPT treats as hidden system prompt instructions.

### Obs 4: ClaudeAdapter Uses Native Settings at Session Initialization
In `apps/server/src/provider/Layers/ClaudeAdapter.ts:4093–4098`:
`ClaudeAdapter` configures `settings: { customInstructions: hardwarePrompt }` once at `startSession` and leaves `sendTurn` inputs unmodified.

---

## 2. Logic Chain

1. **Step 1 (Root Cause of Visibility Bug)**: In `CodexAdapter.ts`, `CursorAdapter.ts`, `GrokAdapter.ts`, and `OpenCodeAdapter.ts`, `hardwarePrompt` was concatenated directly to `input.input` (user prompt text) instead of being routed to system/developer instructions.
2. **Step 2 (Root Cause of Redundancy Bug)**: Because `sendTurn` executes on every user message submission, the entire 100+ line `[EMBEDINO HARDWARE CONTEXT]` block is re-prepended on every single turn.
3. **Step 3 (External Client Impact)**:
   - In OpenAI Codex / ChatGPT Desktop App / ChatGPT Web App, the backend treats `turnInput` as the user's message.
   - The thread title is automatically named `[EMBEDINO HARDWARE CONTEXT]`.
   - The user message bubble renders the internal hardware instructions.
4. **Step 4 (Remediation Logic)**:
   - For Codex: Keep `input.input` clean and pass `hardwarePrompt` to `collaboration_mode.settings.developer_instructions` via `CodexDeveloperInstructions.ts` and `CodexSessionRuntime.ts`.
   - For Cursor, Grok, OpenCode: Remove string concatenation in `sendTurn` and pass clean user text `input.input?.trim()`.

---

## 3. Caveats

- In `ClaudeAdapter.ts`, custom instructions are attached at `startSession`. If a user connects a device mid-session, the Claude session retains its initial custom instructions until the session is restarted.
- In ACP-based providers (Cursor/Grok), if embedded dynamic context is required in the future, it should be passed via `ContentBlock::Resource` (URI `embedino://hardware-context`) rather than `ContentBlock::Text` to prevent rendering as user dialogue.

---

## 4. Conclusion

The dual bugs of **Redundancy** (injecting on every turn) and **Visibility** (rendering in chat bubbles / setting thread title to `[EMBEDINO HARDWARE CONTEXT]`) across external provider apps stem from `hardwarePrompt` string concatenation into `input.input` in `CodexAdapter.ts:1820`, `CursorAdapter.ts:970`, `GrokAdapter.ts:959`, and `OpenCodeAdapter.ts:1446`.

Applying the provided diffs routes hardware context cleanly through `developer_instructions` for Codex / OpenAI and preserves pristine user turn inputs across all provider adapters.

---

## 5. Verification Method

1. **TypeScript Typecheck**:
   ```powershell
   pnpm run tc
   ```
2. **Automated Vitest Suite**:
   ```powershell
   pnpm --filter @t3tools/server test apps/server/src/provider/Layers/CodexSessionRuntime.test.ts
   pnpm --filter @t3tools/server test apps/server/src/provider/Layers/CodexAdapter.test.ts
   ```
3. **Manual Validation in ChatGPT Desktop / Web App**:
   - Start an OpenAI Codex turn with an active board connected.
   - Submit user prompt `"Make an LED blink"`.
   - Confirm thread title is derived from user prompt (not `[EMBEDINO HARDWARE CONTEXT]`).
   - Confirm user bubble contains only `"Make an LED blink"`.
   - Confirm AI response complies with hardware and toolchain rules.
