# Embedino Workspace — Full Bug Audit & Fix Report

**Date of Audit:** August 23, 2026
**Branch:** `beta` (with in-progress streaming/reasoning/interrupt work in the working tree — preserved as-is)
**Scope:** Entire monorepo (`core/apps/*`, `core/packages/*`, `core/scripts/`, tests)
**Method:** Mandatory verification suite baseline + three parallel deep bug-hunt passes (server, web, packages/desktop) + manual verification of every finding against source before fixing

---

## 1. Executive Summary

| Category | Count | Status |
| --- | --- | --- |
| Production code bugs fixed | 12 | ✅ Fixed & verified |
| Test-suite defects fixed (Windows portability, stale expectations, flaky timeout) | 40 tests across 6 packages | ✅ Fixed & verified |
| Test failures documented as environment-dependent (Linux-CI-only integration tests) | 117 in `apps/server` | 📋 Documented (§5) |
| Lower-priority findings documented, not fixed | 7 | 📋 Documented (§6) |

**Verification results after all fixes:**

- `pnpm run tc` (strict typecheck, all packages) — **PASS**
- `pnpm exec vp check --fix` (lint + format) — **PASS, 0 errors** (17 pre-existing warnings remain in untouched/WIP files)
- `pnpm run build:desktop` (full production build) — **PASS**
- Test suites: `packages/shared` 347/347 · `packages/tailscale` 13/13 · `packages/client-runtime` + `contracts` 604/604 · `apps/desktop` 516/516 · `scripts` 196 pass + 2 symlink-privilege skips · `apps/web` 286/286

---

## 2. Production Bugs Fixed

Severity ordering below. Every fix was verified by reading the surrounding implementation and, where a test suite existed, by running it.

### 2.1 HIGH — Security: workspace sandbox escape via symlink in `writeFile`

- **File:** `core/apps/server/src/workspace/WorkspaceFileSystem.ts`
- **Root cause:** `readFile` resolves the realpath of the workspace root and target and rejects paths that escape the root, but `writeFile` only performed the *lexical* containment check (`path.resolve`/`path.relative`). A symlink inside the workspace pointing outside it (git checkouts materialize symlinks) let any client with workspace scope overwrite arbitrary files outside the workspace (`makeDirectory(recursive)` also created directories *through* symlinked components). Reading the same path correctly failed — the asymmetry was clearly unintentional.
- **Fix:** `writeFile` now (1) realpaths the workspace root, (2) walks up to the deepest *existing* ancestor of the target directory and verifies containment (new files legitimately target not-yet-existing directories), (3) resolves an existing target through realpath and writes via the resolved path only when it stays inside the root. New regression test added (`rejects writes through symlinks that resolve outside the workspace root`).

### 2.2 HIGH — Web: plan follow-up send failure silently destroyed the user's typed text

- **File:** `core/apps/web/src/components/ChatView.tsx`
- **Root cause:** the plan-follow-up branch of `onSend` cleared the composer *before* dispatching, and `onSubmitPlanFollowUp`'s failure path removed the optimistic message and showed an error banner — but never restored the draft. The refine text the user typed was unrecoverable (the normal send path has a careful restore; the follow-up path had none).
- **Fix:** the follow-up handler now accepts the user's original draft text and restores it into `promptRef`, the draft store, and the editor cursor when the send fails and nothing else was typed in the meantime.

### 2.3 HIGH — Web: "Retry" after a failed turn dropped image attachments

- **File:** `core/apps/web/src/components/ChatView.tsx` (`retryLastFailedTurn`, part of the in-progress work)
- **Root cause:** the retry re-sent only the text of the last user message with `attachments: []`. A retried message that originally carried screenshots silently lost them.
- **Fix:** the retry now reloads each persisted image attachment's bytes from its resolved asset URL, rebuilds the upload data URLs, shows them optimistically, and includes them in the turn-start command. A failed image load logs and skips that image rather than blocking the text retry. (`readFileAsDataUrl` widened from `File` to `Blob`.)

### 2.4 HIGH — Web: "Implement plan in new thread" deleted a running thread when only navigation failed

- **File:** `core/apps/web/src/components/ChatView.tsx` (`onImplementPlanInNewThread`)
- **Root cause:** the failure path unconditionally called `deleteThread` — even when `createThread` **and** `startThreadTurn` had already succeeded and only `waitForStartedServerThread`/`navigate` failed (router chunk failure, session lapse). The user lost a live implementation turn and got a misleading "Could not start" toast.
- **Fix:** cleanup-delete now runs only when the turn never started; a post-start failure keeps the thread and shows an accurate "Implementation thread started — opening it failed, find it in the thread list" toast.

### 2.5 HIGH — Client/server divergence: `thread.reverted` dropped messages the server keeps

- **Files:** `core/packages/client-runtime/src/state/threadReducer.ts` (vs. `apps/server/src/orchestration/projector.ts`)
- **Root cause:** the server projector retains unbound user *and* assistant messages oldest-first up to the revert's `turnCount`; the client reducer kept *all* unbound messages and had no fallback — the two views diverged after every revert of a thread with uncheckpointed turns, until the next full snapshot (which a live resumable subscription may never send).
- **Fix:** `retainMessagesAfterRevert` is now a faithful mirror of the server's algorithm (including both user and assistant fallbacks), plus a regression test.

### 2.6 MEDIUM — Web: failed send left the timeline in stale `anchoring-new-turn` state

- **File:** `core/apps/web/src/components/ChatView.tsx` (`onSend`, `onSubmitPlanFollowUp`, `retryLastFailedTurn`)
- **Root cause:** send-time scroll-anchor state was armed before the server call; the failure branches removed the optimistic row but never reset the anchor mode/index, so the streaming-adjust effect kept issuing `scrollToOffset` calls against a stale anchor on every timeline change (view jumps while reading), and the scroll-to-end pill could not reappear.
- **Fix:** all three failure branches now reset the anchor state the same way `scrollToEnd` does.

### 2.7 MEDIUM — Server: self-update `inFlight` flag never cleared on success

- **File:** `core/apps/server/src/cloud/selfUpdate.ts`
- **Root cause:** the flag was reset via `Effect.onError`, which never runs on success. The launcher applies updates on a later boot, so a successful prepare leaves the server running with the flag stuck `true` — every future `serverUpdateServer` RPC fails with "already in progress" until restart.
- **Fix:** `Effect.onExit` — resets on every exit (success, failure, interrupt).

### 2.8 MEDIUM — Server: Arduino CLI install leaked the temp archive and its file handle on failure

- **File:** `core/apps/server/src/toolchain/ToolchainService.ts`
- **Root cause:** on abort mid-download, network drop, or failed `tar` extraction, the `WriteStream` was never ended/destroyed (fd held until GC) and the partial `arduino-cli-*.zip` stayed in the OS temp dir forever; repeated attempts accumulated files.
- **Fix:** download/extract wrapped in `try/catch/finally` — reader cancelled on error, stream destroyed when not cleanly ended, temp archive unlinked on every exit path.

### 2.9 MEDIUM — Server: PlatformIO install reported success without verification, and silently fell back to system pip

- **File:** `core/apps/server/src/toolchain/ToolchainService.ts`
- **Root cause:** the 100 % "installed and verified successfully" event was emitted unconditionally — even when `findPio` could not find the binary. Additionally, when the venv's pip was missing (partially-created venv), the code silently installed into the *system* Python, defeating the penv isolation.
- **Fix:** success is now gated on an actually-discoverable `pio` binary (throwing a descriptive error otherwise), and the system-pip fallback is surfaced as a visible progress warning instead of happening silently. (Full venv-recreation on missing pip is listed in §6 as a design follow-up.)

### 2.10 MEDIUM — Server: device association persisted dead state as success

- **File:** `core/apps/server/src/hardware/DeviceService.ts`
- **Root cause:** `setDeviceAssociation` looked up the device to get VID/PID, but when the device had vanished (unplug race) or carried no USB ids it still persisted `{vid: "", pid: ""}` — a row that can never match any scanned device — and returned `success: true`.
- **Fix:** returns `{ success: false }` and skips persisting when VID/PID are unavailable.

### 2.11 MEDIUM — Desktop: local bearer token cached for process lifetime with no expiry

- **File:** `core/apps/desktop/src/backend/DesktopLocalEnvironmentAuth.ts`
- **Root cause:** the minted session token (server TTL: 30 days) was cached in a main-process `Ref` with no `expires_at` tracking. Long-running desktop sessions (the crash-recovery logic explicitly targets these) eventually handed every new renderer a token the server rejects, with no recovery short of an app restart.
- **Fix:** the cache now stores `expiresAtMillis` (from the session's `expires_in`) and re-mints when within a 5-minute margin of expiry.

### 2.12 LOW — Contracts: dead RPC method constants + missing settings-patch key; reducer: inconsistent stop settlement

- `core/packages/contracts/src/rpc.ts` — removed `projectsAdd`/`projectsRemove` from `WS_METHODS`: defined nowhere in any RPC group, handler, or caller; calling them would be a runtime `undefined is not a function`.
- `core/packages/contracts/src/settings.ts` — `ClientSettingsPatch` now includes `dismissedProviderUpdateNotificationKeys` (present in `ClientSettingsSchema` but silently dropped from every patch composed via `UnifiedSettingsPatch`).
- `core/packages/client-runtime/src/state/threadReducer.ts` — `thread.session-stop-requested` now optimistically settles a running `latestTurn` to `interrupted`, mirroring the interrupt handling (the two "make it stop" round-trips previously rendered differently during stream latency).

Also bounded a slow leak in the in-progress streaming work: `assistantBufferSinceByMessageId` (`ProviderRuntimeIngestion.ts`) was a plain unbounded `Map`; it now evicts oldest entries at a 10 000-entry cap, matching the adjacent caches.

---

## 3. Test-Suite Defects Fixed

All of these were real, reproducible failures on this Windows machine. Fixing each layer revealed the next (`vp run` stops scheduling after failures, so earlier failures had been masking deeper ones). CI runs on `ubuntu-latest`, which is why these survived.

### 3.1 `packages/shared` — 5 failures (fixed)

- `relayClient.test.ts` (4): the tests mocked `HostProcessPlatform` as `"linux"` while running against the real Windows filesystem — the POSIX exec-bit check (`mode & 0o111`) can never pass on NTFS (chmod cannot set mode bits), and expected paths were built with forward slashes while `path.join` yields backslashes. Fix: run against the real host platform/arch (the References default to them), derive expected names/paths from `HostProcessPlatform`/`HostProcessArchitecture` and `node:path`, per the repo's `no-global-process-runtime` lint rule.
- `logging.test.ts` (1): relied on `ENAMETOOLONG` from a 300-char filename — Linux-only; on Windows the stat failure is ENOENT, which the sink correctly treats as "missing file", so no error propagated. Fix: a null byte in the filename now produces a deterministic non-ENOENT stat failure (`ERR_INVALID_ARG_VALUE`) on every platform.

### 3.2 `packages/tailscale` — 7 failures (fixed)

All seven tests asserted the executable name `"tailscale"` while the implementation correctly resolves `tailscale.exe` on win32. Expectations now read `HostProcessPlatform` the same way the source does.

### 3.3 `apps/desktop` — 19 failures (fixed)

- **Path-separator expectations (17):** `DesktopAppIdentity`, `DesktopEnvironment`, `DesktopAssets`, `DesktopConnectionCatalogStore`, `DesktopSavedEnvironments`, `DesktopBackendConfiguration`, `preview/Manager`, and `scripts/electron-launcher.test.mjs` all hardcoded POSIX-joined expected paths (or matched mocks against POSIX spellings) while the implementations join with the host-native Path service. Expected values now join the same segments the same way (`node:path` / the Effect `Path` service).
- **Stale theme expectation (1):** `preview/Manager.test.ts` still asserted the pre-rebrand branded-blue default (`oklch(0.488 0.217 264)`); commit `5919d84` ("Rebrand cleanup") changed the default to the grayscale palette but never updated the test — broken on *every* platform since then, just never reached.
- **Flaky throughput timeout (1):** `DesktopObservability` "bounds the number of retained backend child output chunks" pushes 300 sequentially-awaited chunks and exceeded the default 5 s budget under load; given an explicit 30 s timeout (a throughput test, not a liveness one).

### 3.4 `scripts` — 2 failures (fixed)

`build-desktop-artifact.test.ts` and `mock-update-server.test.ts` create real symlinks; Windows denies symlink creation (EPERM) without Developer Mode or elevation. Both now probe symlink capability once and `skipIf` unavailable — identical skips added to the server's `WorkspaceFileSystem` symlink test. (On Linux CI these all run normally.)

### 3.5 New regression coverage added

- `threadReducer.test.ts` — revert retains unbound user messages oldest-first up to `turnCount` (server-parity).
- `WorkspaceFileSystem.test.ts` — `writeFile` rejects symlink escapes and does not touch the linked target.

---

## 4. Verification Evidence

| Gate | Result |
| --- | --- |
| `pnpm run tc` | PASS (exit 0) |
| `pnpm exec vp check --fix` | PASS — 0 errors, 17 pre-existing warnings |
| `pnpm run build:desktop` | PASS (exit 0) |
| `packages/shared` tests | 347/347 |
| `packages/tailscale` tests | 13/13 |
| `packages/client-runtime` + `contracts` tests | 604/604 |
| `apps/desktop` tests | 516/516 |
| `scripts` tests | 196 pass, 2 symlink-privilege skips |
| `apps/web` tests | 286/286 |

---

## 5. Known Remaining: `apps/server` integration tests require the CI (Linux) environment

117 tests in `apps/server` fail **on this Windows machine only**. Classification of the failure modes:

1. **External CLIs not installed** (`spawn claude ENOENT`, similarly codex/cursor variants) — the adapter/text-generation integration tests spawn the real provider CLIs. Largest group (CursorAdapter 18, CodexTextGeneration 17, Grok 6, Claude 5, Cursor 4, ProviderRegistry 4, …).
2. **Symlink privilege** (EPERM) — e.g. `VcsStatusBroadcaster` symlinked-CWD tests.
3. **CRLF checkout semantics** — git on Windows (autocrlf) checks out `v2\n` as `v2\r\n`; checkpoint-revert integration tests assert byte-exact LF.
4. **POSIX-only constructs** — `/dev/null` paths resolving to `C:\dev\null`, `fsync` on directory fds (EPERM on Windows), shebang-less script spawns (EFTYPE).

These are environment assumptions, not product bugs — the project's CI (`.github/workflows/ci.yml`, `runs-on: ubuntu-latest`, `vp run test`) covers them. Making them Windows-portable means redesigning them around mocks/fixtures (and skip-gating 117 tests would silently gut coverage), which is a separate workstream — recommended only if Windows-local test runs become a workflow requirement. An alternative quick win: enable Windows **Developer Mode** (allows unprivileged symlink creation) to shrink groups 2 immediately.

## 6. Documented, Not Fixed (design-level follow-ups)

1. **Bootstrap worktree orphan** (`apps/server/src/ws.ts`): a failed bootstrap turn-start leaves the created git worktree + branch on disk; `cleanupCreatedThread` only deletes the aggregate. Fix = record the worktree path and call `gitWorkflow.removeWorktree` in the same failure path.
2. **Device watch silent degradation** (`DeviceService.subscribeDevices`): on non-Windows, if `fs.watch("/dev")` throws (containers, inotify limits) the stream degrades to a single snapshot with no polling fallback and no error surfaced.
3. **Serial-scoped device associations are dead code**: `StoredAssociation.usbSerialNumber` exists but `resolveDevice` never passes a serial, so two identical boards (same VID/PID) cannot be disambiguated; `setDeviceAssociation` also never populates the field.
4. **PlatformIO venv recovery**: when penv pip is missing the install now warns and falls back; recreating the venv (or failing hard) would preserve isolation fully.
5. **Updater quit latch** (`apps/desktop/src/app/DesktopLifecycle.ts`): `updaterQuitAllowed` never resets after `before-quit-for-update`; a later cancelled update quit could skip graceful shutdown on the next normal quit.
6. **Preview-annotation thumbnails paired by array index** (`MessagesTimeline.tsx` `UserTimelineRow`): annotations are matched positionally to attachments named `preview-annotation-*`; a sent-without-screenshot annotation or a coincidentally named user file mis-pairs thumbnails.
7. **Pre-existing lint warnings (17)**: unused imports/variables in WIP files (`OpenCodeAdapter`, `ChatView`, wiring components) and two `no-array-index-key` usages in PullRequest components that carry explicit design comments. Left for the feature owners.

---

## 7. Files Changed (this audit)

Production code: `WorkspaceFileSystem.ts` (+ test), `selfUpdate.ts`, `ToolchainService.ts`, `DeviceService.ts`, `ProviderRuntimeIngestion.ts`, `OpenCodeAdapter.ts` (unchanged by audit), `ChatView.tsx`, `ChatView.logic.ts`, `threadReducer.ts` (+ test), `rpc.ts`, `settings.ts`, `DesktopLocalEnvironmentAuth.ts`.

Tests made host-portable: `relayClient.test.ts`, `logging.test.ts`, `tailscale.test.ts`, `DesktopAppIdentity.test.ts`, `DesktopEnvironment.test.ts`, `DesktopAssets.test.ts`, `DesktopConnectionCatalogStore.test.ts`, `DesktopSavedEnvironments.test.ts`, `DesktopBackendConfiguration.test.ts`, `preview/Manager.test.ts`, `DesktopObservability.test.ts`, `electron-launcher.test.mjs`, `build-desktop-artifact.test.ts`, `mock-update-server.test.ts`.

The pre-existing uncommitted feature work (live streaming, reasoning rows, interrupt/abort lifecycle, retry button, incremental markdown rendering) was preserved; where it contained the bugs fixed above (retry attachments, map bound), the fixes were made in place.
