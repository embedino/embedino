# Embedino — Agent Instructions & Engineering Guide

Welcome to the **Embedino** codebase. This document is the single source of truth for AI agents (and human engineers) working on Embedino. Read this thoroughly before making modifications.

---

## 1. Project Overview & Philosophy

**Embedino** is an open-source, local-first, AI-powered IDE and workspace designed specifically for embedded systems, microcontrollers, and hardware engineering.

### The 5 MVP Killer Features

1. **Bring-Your-Own-Provider AI:** Context-aware embedded assistant for debugging pinouts, explaining compiler logs, and analyzing code.
2. **Automatic Board & Device Detection:** Instant polling of connected USB/COM devices and microcontrollers.
3. **One-Click Flash & Build:** Seamless integration with PlatformIO, Arduino CLI, and native toolchains.
4. **Interactive Wiring Viewer:** Vector-based component wiring diagrams with isolated preview tabs.
5. **AI Datasheet Explorer:** PDF reader with selectable text layer and instant "Ask AI" context injection.

---

## 2. Monorepo Architecture

The codebase is a TypeScript monorepo managed with **pnpm** and **Vite+ (`vp`)**:

```
embedino workspace/
├── AGENTS.md                # Workspace-level guide
├── docs/                    # Project context & timeline notes
└── core/                    # Main monorepo root
    ├── apps/
    │   ├── web/             # React 19 Frontend (@tanstack/react-router, Effect atoms)
    │   ├── desktop/         # Electron harness (Main process, Preload scripts)
    │   └── server/          # Local backend service & WebSocket RPC engine
    │                        #   (published npm package name: `embedino`, bin: `embedino`)
    ├── packages/
    │   ├── contracts/       # Effect Schemas, RPC method contracts, toolchain types
    │   ├── client-runtime/  # Client-side RPC runtime and stream handlers
    │   └── shared/          # Shared utilities across client and server
    ├── native/              # Rust helpers (resource monitor, ghostty VT)
    ├── scripts/             # Build, packaging, and CI helper scripts
    └── package.json         # Workspace scripts
```

All workspace packages are scoped under `@embedino/*`. The desktop app identity is `app.embedino.desktop`; deep links use the `embedino://` scheme; environment variables use the `EMBEDINO_*` / `VITE_EMBEDINO_*` prefix; per-user state lives under `~/.embedino`.

---

## 3. Modular Isolation Principle

Keep feature work modular so large features never destabilize core surfaces:

- **Dedicated directories per domain (95%):**
  - Schemas & Contracts: `packages/contracts/src/hardware/...`, `toolchain.ts`
  - Frontend Components: `apps/web/src/components/hardware/...`, `components/wiring/...`
  - Reactive Atoms: `apps/web/src/state/hardware.ts`, `state/toolchain.ts`
  - Backend Services: `apps/server/src/hardware/...`, `apps/server/src/toolchain/...`
- **Thin integration points (5%):** when a feature must touch shared files (RPC registration in `packages/contracts/src/rpc.ts` + `apps/server/src/ws.ts`, UI mounting in `SidebarChrome.tsx` / `SettingsPanels.tsx`), keep those edits to 1–2 lines so they stay reviewable and conflict-free.

---

## 4. Toolchain & Hardware State Integration

Embedino implements hardware management following the isolation principle:

- `packages/contracts/src/toolchain.ts`: Defines `ToolchainStatus`, `ToolchainType`, `ToolchainInstallProgressEvent`, and errors.
- `apps/server/src/toolchain/ToolchainService.ts`: Detects installed toolchain binaries via filesystem checks without process spawning.
- `apps/web/src/state/toolchain.ts`: Reactive Effect atoms for toolchain installation state.
- `apps/web/src/components/wiring/ToolchainSetup.tsx`: Getting-started pill & installation dialog.
- RPC endpoints: `toolchain.installPlatformio`, `toolchain.installArduino`, `toolchain.getStatus`.

---

## 5. Verification & Build Commands

Before committing or completing any task, you **MUST** run and pass all verification checks:

```bash
# 1. Strict TypeScript Typecheck across all workspace packages
pnpm run tc

# 2. Linter and Formatter (auto-fixes formatting issues)
pnpm exec vp check --fix

# 3. Full Production Build (Web, Server, and Desktop Electron)
pnpm run build:desktop
```

---

## 6. Code Quality & Standards

- **No "AI Smells":** Avoid placeholders, arbitrary timeouts (`setTimeout`), mock data in production paths, or bypass flags (`--no-verify`).
- **Effect TS Best Practices:** Use standard Effect schemas, `Schema.TaggedErrorClass`, and atomic state.
- **Pruned Folders:** `apps/mobile` and marketing pages are intentionally pruned for Embedino desktop/web focus. Do not restore them.

---

## 7. Feature Switches

Product features are toggled centrally in `packages/contracts/src/features.ts`
(`EmbedinoFeatures`) — disabled features stay in the codebase, just switched off:

| Flag                                                           | Default | Controls                                                                                                                     |
| -------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `connectCloud`                                                 | `false` | Embedino Connect cloud suite: Clerk sign-in, cloud relay linking, managed tunnels, CLI OAuth. Local QR pairing is unaffected |
| `telemetryExport`                                              | `false` | Shipping analytics/traces off-device (PostHog events, desktop OTLP export). Local diagnostics unaffected                     |
| `gitForgeGitLab` / `gitForgeBitbucket` / `gitForgeAzureDevOps` | `false` | Per-forge PR/source-control integrations (GitHub stays always on)                                                            |

When adding a feature that should be switchable: gate it at its registration
choke point (provider registry, layer wiring, or config resolver), not scattered
through call sites.
