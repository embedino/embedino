# BRIEFING — 2026-08-19T09:10:00Z

## Mission
Investigate the Toolchain & Build/Flash Subsystem in Embedino, analyzing architecture, rationale, detection, installation lifecycle, event streaming, and UI/UX integration.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, synthesist
- Working directory: c:\Users\rapid\Desktop\embedino workspace\.agents\explorer_toolchain_1
- Original parent: 7d128aee-7012-44e9-8636-c1a60687e301
- Milestone: Toolchain Subsystem Investigation

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Write only to .agents/explorer_toolchain_1
- Follow 95/5 modular isolation principle and monorepo architectural rules

## Current Parent
- Conversation ID: 7d128aee-7012-44e9-8636-c1a60687e301
- Updated: 2026-08-19T09:10:00Z

## Investigation State
- **Explored paths**:
  - `packages/contracts/src/toolchain.ts`
  - `packages/contracts/src/rpc.ts`
  - `packages/contracts/src/index.ts`
  - `packages/client-runtime/src/rpc/client.ts`
  - `apps/server/src/toolchain/ToolchainService.ts`
  - `apps/server/src/hardware/HardwareAgentPrompt.ts`
  - `apps/server/src/ws.ts`
  - `apps/server/src/auth/RpcAuthorization.ts`
  - `apps/web/src/state/toolchain.ts`
  - `apps/web/src/components/wiring/ToolchainSetup.tsx`
  - `apps/web/src/components/settings/SettingsPanels.tsx`
  - `apps/web/src/components/sidebar/SidebarChrome.tsx`
  - `apps/web/src/components/hardware/BoardSelectorPopover.tsx`
  - `apps/web/src/components/ChatView.tsx`
- **Key findings**:
  - Toolchain detection utilizes non-blocking filesystem existence checking (`existsSync`) across prioritized candidate paths (<1ms overhead) rather than slow shell process spawning.
  - Automated installation pipelines handle native binary download/extraction for Arduino CLI and isolated Python virtualenv (`~/.platformio/penv`) for PlatformIO with real-time WebSocket progress streaming.
  - Resolved absolute binary paths are injected into `HardwareAgentPrompt.ts` alongside active toolchain preferences, eliminating AI hallucination across all provider adapters.
  - One-click build, flash, and serial monitoring in `ChatView.tsx` and `BoardSelectorPopover.tsx` validate project file structure (`platformio.ini` vs `.ino`) against selected toolchain and launch real-time interactive terminals.
  - General settings row implements a key-based remounting pattern (`toolchainSelectKey`) to prevent Base UI select locking on "Manage Toolchain...".
- **Unexplored areas**: None. Comprehensive investigation completed across all toolchain layers.

## Key Decisions Made
- Authored full technical rationale and architecture document: `toolchain_rationale.md`.
- Completed 5-component handoff report: `handoff.md`.

## Artifact Index
- `c:\Users\rapid\Desktop\embedino workspace\.agents\explorer_toolchain_1\toolchain_rationale.md` — Comprehensive toolchain architectural & rationale report
- `c:\Users\rapid\Desktop\embedino workspace\.agents\explorer_toolchain_1\handoff.md` — 5-component handoff report
- `c:\Users\rapid\Desktop\embedino workspace\.agents\explorer_toolchain_1\progress.md` — Progress & liveness tracker
