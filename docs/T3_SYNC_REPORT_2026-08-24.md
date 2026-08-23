# Embedino ← T3 Code Upstream Sync Report

**Date:** August 24, 2026
**Branch:** `beta` (backup of pre-sync state: `backup/pre-t3-sync-2026-08-24`)
**Sync range:** upstream `pingdotgg/t3code` `038560e` (2026-08-14) → `09df91f` (2026-08-23) — 239 upstream commits analyzed one by one.
**Method:** every upstream commit classified as port / skip by four parallel analysis passes; ported changes applied via per-file 3-way merges (base = upstream Aug 14, ours = Embedino, theirs = upstream Aug 23) plus hand-ports for files with heavy Embedino divergence. All incoming code rebranded (T3 → Embedino); final sweep confirms **zero T3 references** in `core/`.

## Verification

- `pnpm run tc` (strict typecheck, 12 packages) — **PASS**
- `pnpm exec vp check --fix` — **PASS, 0 errors** (19 pre-existing warnings)
- `pnpm run build:desktop` — **PASS**

## Scope decisions (owner-approved)

- Fixes-only sync: **no UI redesigns, no new t3 product features**.
- Small UI **bug** fixes (clipping, double borders, alignment, blank clipboard, tooltips) — included.
- **Skills menu redesign** (`$` menu + `/` slash menu) — included per owner request, adapted to Embedino's existing menu design (kept our SkillGlyph, install-source labels, and menu styling; upstream's badge layout was not copied wholesale).

## Ported — highlights

### Server (crash / correctness / robustness)
- Dead-socket write (EPIPE) no longer crashes the whole server (`httpResponseErrorGuard`).
- SQLITE_BUSY: concurrent writers wait via `busy_timeout` PRAGMA.
- Orphaned provider sessions are settled at startup after a restart.
- Merged-PR threads settle only once; PRs inherited from default upstreams no longer attach to feature threads.
- Git: pushes no longer hit the command timeout; `git worktree add` gets a longer timeout; files named `HEAD` no longer break status; remote default branch is used instead of assuming `main`.
- Providers: Claude kill now stops orphaned work; "Always allow for session" actually sticks; capability probes skip user hooks; unanswered questions settle when a session stops; Codex background memory stays out of chats; missing Codex rollouts are recoverable; Daybreak models not flagged legacy; disabled Grok/Cursor/OpenCode providers are no longer probed (Grok/OpenCode now default off, opt-in from Settings).
- Pull requests: provider API budgets protected (rate-limit backoff), review comments land on the correct context lines (GitLab/Bitbucket), thread-comment pagination (`pullRequests.threadComments` RPC + ws handler + auth scope).
- OpenCode: `OPENCODE_CONFIG_CONTENT` no longer clobbers the user's config; plan agent hidden/healed when legacy plan mode is off.
- Terminal: process-table snapshot polling (no more PID-space flooding).
- Source control: SSH remotes with non-git user prefixes detected; slow `az` CLI gets a longer probe budget; removed Bitbucket permissions endpoint is non-blocking; outdated `gh` no longer reads as signed out.
- MCP preview toolkit returns valid results.
- Thread title mirror no longer overwrites real thread titles.

### Desktop / packaging
- Backend readiness probing loops while the process lives (no more stuck "Connecting…").
- Windows destroyed before quit cleanup; unthrottled cold-start first paint; hidden preview renderers throttled; app zoom no longer zooms the preview browser; custom macOS dock icon preserved; queued updates refresh before install; UTF-8 locale for agent shells on macOS; deep-link protocol allowlist tightened (security).
- Tailscale spawn defects no longer break advertised endpoints.

### Web / client
- Terminal: ctrl+c copies selection (blank clipboard fixed), Shift+Insert paste, right-click paste, shifted-character encoding, oversized grapheme crash, mouse-motion rerender flood; context-menu leak fixed (`dismissContextMenu` + `close` API).
- Chat: oversized prompts rejected before a turn starts; failed thread bootstraps retry with a fresh id (draft no longer dead-ends); mixed tool runs not marked failed; recovered tool failures lose red styling; streaming follow-ups no longer pushed above the running turn; keep-following the stream after scrolling back to the live edge (via merged logic files where applicable); XML-like tags in user messages preserved; oversized search queries no longer crash; unknown timezone degrades to UTC.
- Markdown: ordered-list marker gutter for 3+ digit lists (tabular markers), ordered-list edge cases, **workspace images render in chat via signed asset URLs** (Windows drive paths normalized, placeholder + failure fallback — wiring diagrams and screenshots referenced in chat now display), file-link tooltips show the full path, spaced folder links cmd-click.
- Work log: command output (Codex aggregated output / Claude projected summaries) replaces the echoed command; menu radio-item icons align to the text grid; usage breakdown shows every period instead of the first 8.
- Preview: loading bar no longer causes rerender storms (CSS-driven), loopback ports open on localhost, floating preview stays anchored, sibling column width reserved during panel resize.
- Files: diff files open from nested projects; bare filename references resolve; commit dialog shows filenames on path overflow; file-tree refresh refreshes the open preview.
- Sidebar logic: pinned threads don't reshuffle after drop; settled pinned threads move to the settled section (logic layer).
- Keybindings: non-Latin keyboard layouts no longer trigger duplicate shortcuts.
- Provider updates: no duplicate progress notifications; hidden while updating.
- Themes: OKLCH gamut bounded; dark custom-theme palette restored; Open VSX import limits raised (dependency-heavy themes import).

### Skills (owner-requested feature)
- OpenCode skill discovery via CLI/SDK inventory (`ServerProviderSkill`).
- Claude discovers repo-local `.agents/skills`.
- Skills listed in the `/` slash menu with `/skill:` prefix, deduplicated against provider slash commands, toggleable via Settings → General → "Show skills in slash menu" (`showSkillsInSlashMenu`, default on).
- Skills render in Embedino's own menu design (SkillGlyph + install-source label), consistent with the existing UI.

### Packages
- contracts: image MIME allowlist + attach-time rejection, `bootstrapThreadDisposition`, session-start `title`, provider-enabled resolution (`resolveProviderInstanceEnabled`), context-menu `close`.
- client-runtime: provider skills module, markdown workspace images, branch-list paging fix, thread-search crash fix, reconnect after credential failure mid-update.
- ssh: cold remote servers finish starting; failed remote installs surface (0-byte server.log) instead of hanging; remote PATH preserved.
- shared: source-control providers matched by DNS label.

## Skipped (with reasons)

- **Mobile / marketing** — apps not shipped in Embedino.
- **t3 product features** — Codex feedback to OpenAI, client-attribution analytics, macOS launchd service, `npx t3 triage`, T3 Connect/Clerk passkey fixes (Connect cloud off).
- **UI redesigns / feature reworks** (owner: don't change the UI) — workspace navigation rework, usage insights redesign, composer state drawers, tool-activity collapse, PR detail rework, thread action menus, appearance contrast control, theme library polish, global styling refactor, tooltip migration, built-in mobile themes, hold-to-quit, tab mute, external project icons, task tabs, cmd+enter background threads, double-click rename, shortcuts dropdown, confirm-before-terminal-close, file drops, SSH remote-open in editor, browser defaults/Integrations page, right-panel maximize binding, PWA manifest (deferred).
- **CI / build-infra churn** — release build speedups, Windows `server.asar` packaging (deferred; heavy lockfile churn), AUR packaging, DMG artwork, test-suite refactors.
- **Net-zero pairs** — `d7abd7f`/`804cba4`, `62654d2`/`aa17ec6` (commit + exact revert).
- **Already fixed here** — dark theme selector specificity (our CSS already carries it).

## Worth considering later (owner opt-in)

cmd+enter create thread in background (#7821), confirm before closing a terminal with a live process (#7592, protects long build/flash jobs), workspace-wide file drops (#6636), SSH remote-open in local editor (#6572), bindable right-panel maximize (#5091), Windows release packaging speedup (#7975).

## Known deferred items

- `ThreadStatusIndicators` settle callers pass `{ state }` without `updatedAt`, so the client-side "settle only once" refinement uses the terminal-state check only (server-side adjudication is fully ported).
- The `be7d35aa` preview-loading fix was hand-applied; the rest of `PreviewView` was not restructured (browser-defaults feature skipped).
- Sidebar visual fixes from skipped redesign commits (un-settle tooltip, project-menu padding, provider accent badges) were not ported to avoid redesign contamination of our customized Sidebar.
- Chat timeline anchoring: kept the base end-space resolver (reverse search) paired with the new user-message-only anchor extractor from #7897. Upstream's forward-search resolver is an invariant of the skipped tool-activity rework (#7152) and is incompatible with our timeline; the user-visible fix (follow-ups no longer anchor to assistant messages) is preserved.
- `d550b829` (changed-files hover clipping) and `20e5a339` (remote editor deep-link allowlist) were hand-ported after their companion tests surfaced them.
- Theme library polish (#7580) and the hermetic Windows Claude text-generation tests (#4508) were skipped (low value / test-only); their files remain at Embedino state.
- The upstream UsagePage redesign tests were not ported (they assert the skipped redesign's component mocks); the periods fix itself is ported and verified by the rest of the suite.

## Verification (final)

- `pnpm run tc` — **PASS** (all 12 packages)
- `pnpm exec vp check --fix` — **PASS, 0 errors**
- `pnpm run build` (all apps, production) and `pnpm run build:desktop` — **PASS**
- `pnpm run test` — **PASS** everywhere except `apps/server`, whose failures were verified one by one to be the same Windows-environment categories documented in `docs/BUG_AUDIT_REPORT_2026-08-23.md` §5 (missing provider CLIs → spawn ENOENT/EFTYPE, symlink EPERM, CRLF checkout semantics, POSIX-only paths). No sync regressions. One upstream cross-app test importing the removed mobile app (`test/ActivityPayloadProjection.test.ts`) was not ported.
- T3 reference sweep over `core/` — **0 matches**
