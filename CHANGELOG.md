# Changelog

All notable changes to the Embedino project will be documented in this file.

## [Unreleased]
### Added
- Interactive Wiring Viewer (UI for component-specific wiring maps).
- AI-Powered Datasheet Explorer (pdf.js integration with context injection).

## [2026-08-19]
### Changed
- **Hardware Prompt Efficiency**: Compressed the 1,500-token Embedino System Prompt into a deeply dense, 300-token XML block for massive token savings and increased AI attention.
- **Dynamic Mid-Chat Board Swap**: Added live hardware tracking (`lastHardwarePrompt`) to Cursor, Grok, OpenCode, and Codex adapters. The system now seamlessly intercepts physical USB swaps and updates the AI's internal state (via `[System Update]` injection or background `developer_instructions` overwrite) without requiring a new chat.

## [2026-08-18]
### Added
- **Module Variant Confirmation**: Added Rule 6 to the hardware agent prompt to explicitly ask the user for exact module variants (e.g., `ESP32-S3-WROOM-1-N16R8`) before writing board-specific configurations.
- **Board Naming Dialog UX**: Implemented a dedicated modal (`BoardNamingDialog`) that intelligently intercepts generic board connections (e.g., CP2102, generic ESP32) and explicitly prompts the user to identify their specific variant.

### Changed
- **Board Selector Redesign**: Moved "Flash" and "Monitor" hardware action buttons directly inside the `BoardSelectorPopover` to clean up the chat header. The actions only appear when a valid board is selected and online.

### Fixed
- **Hardware Polling Resilience**: Fixed silent connection failures on initial app load by adding automatic reconnection logic to `useHardwareSubscription`.
- **Windows Device Scanner**: Fixed a PowerShell syntax error in the WMI query (`DeviceService.ts`) that caused the scanner to silently return empty device lists (`[]`), which previously triggered false "No connected devices" states.
- **Live Terminal Streaming**: Fixed bug where agent command execution (`stdout`) was dropped or overwritten. Orchestrator now correctly buffers and streams WebSocket `command_output` into the chat UI.
- **Hardware Agent Context**: Instructed agent to append exact `<sketch_dir>` in compilation commands to prevent workspace root build failures.
- **Test Assertions**: Stabilized AI test failures in `ClaudeAdapter.test.ts`, `CodexAdapter.test.ts`, and `OpenCodeAdapter.test.ts` caused by dynamic hardware context injection. Replaced strict payload string equivalence checks with resilient property validations to decouple tests from system prompt modifications.
- **Generic Board Detection**: Fixed a bug where boards like `ESP32-S3` with hyphens bypassed the generic keyword filter. The detection now strips non-alphanumeric characters for accurate classification.

## [Earlier Phases]
### Added
- **Project Scaffolding**: Automated `platformio.ini` and `.ino` generation based on active toolchain.
- **UI-Aware AI**: Hardware context explicitly provided to AI (prevents hallucinating unsupported toolchains).
- **Flash & Serial Monitor**: Full compilation, flashing, and serial read pipeline.
- **Device Detection**: Real-time USB/COM port polling and BoardSelectorPill UI.
- **Dynamic Toolchain Setup**: One-click install/setup for PlatformIO and Arduino CLI.

### Changed
- **Professional Refactor**: Cleaned codebase of temporary "AI smells", strict typing, and synced with upstream T3 core (commit `038560e`).
