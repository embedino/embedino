# Embedino Project Context

## Overview
**Embedino** is an open-source, local-first, AI-powered IDE and workspace designed specifically for embedded systems, microcontrollers, and hardware engineering. It is a highly customized fork derived from **[pingdotgg/t3code](https://github.com/pingdotgg/t3code)** using **Regraft**.

## Current Upstream Tracking
We track upstream `t3code` changes via `Regraft`. 
- **Last Sync Date**: August 2026
- **Architecture Principle**: 95/5 Modular Isolation Principle. All Embedino-specific features are maintained in isolated directories to prevent merge conflicts during upstream pulls.

## Core Features Implemented
1. **Bring-Your-Own-Provider AI**: Support for Cursor, Grok, OpenCode, Claude, and Codex with custom hardware context injection.
2. **Dynamic Mid-Chat Board Swap**: The system intercepts physical USB hardware changes mid-session and automatically updates the AI's internal state across all supported AI providers.
3. **Hardware State Polling**: Real-time USB/COM polling via `DeviceService.ts` with instant UI updates.
4. **Token-Optimized Hardware Prompts**: Compressed, dense XML system prompts that prevent hallucinated pinouts and configs while minimizing context window footprint.

## Active Engineering Standards
- **Zero Errors Policy**: Strict enforcement of TypeScript type-checking (`pnpm run tc`) and ESLint (`vp check --fix`).
- **Thin Docking Ports**: We use minimal hooks inside official upstream files (like `<ToolchainSetupPill />` and `buildHardwareSystemPrompt`) to keep them thin and robust.
