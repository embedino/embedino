# Embedino Workspace — Agent Instructions

Welcome to **Embedino Workspace**, the repository for **Embedino** — an open-source, local-first, AI-powered IDE for embedded systems, microcontrollers, and hardware engineering.

This file covers workspace-level orientation. For engineering details, verification commands, and architecture rules, read [`core/AGENTS.md`](core/AGENTS.md) — it is the single source of truth for working in the monorepo.

---

## Repository Layout

```
embedino workspace/
├── AGENTS.md          # This file
├── docs/              # Project context & timeline notes
├── logo.svg           # Brand mark (source of truth for icon exports)
└── core/              # The monorepo (apps/web, apps/desktop, apps/server, packages/*)
```

## Key Facts

- **Product name:** Embedino (app), Embedino Workspace (repository/project)
- **Package scope:** `@embedino/*`; server CLI published as `embedino`
- **Deep-link scheme:** `embedino://` (`embedino-dev://` in development)
- **Env-var prefixes:** `EMBEDINO_*`, `VITE_EMBEDINO_*`
- **Per-user state dir:** `~/.embedino`
- **Desktop app id:** `app.embedino.desktop`

## Working in This Repo

1. All source work happens inside `core/`. See `core/AGENTS.md` for architecture, conventions, and the mandatory verification suite (`pnpm run tc`, `pnpm exec vp check --fix`, `pnpm run build:desktop`).
2. Runtime data (`userdata/`, `caches/`, `worktrees/`) and build output (`dist-electron/`) are gitignored — never commit them.
3. Keep feature code in dedicated domain directories; keep edits to shared files minimal and explicit.
