# Programmatic Differential Mapping Report: Embedino vs. Upstream T3 Code

**Generated:** 2026-08-19T14:30:00Z  
**Base Upstream Graft SHA:** `5a84614809b6e853b872f9e57ff4b97e9df5df02` (fix(web): align the composer model picker (#6252))  
**Latest Upstream HEAD SHA:** `24c4ba68f536d56e8482a1e4d7070a6771da551d` (fix(desktop): close the window before quit cleanup (#6562))  
**Upstream Repository:** `https://github.com/pingdotgg/t3code.git`  
**Local Workspace Root:** `c:\Users\rapid\Desktop\embedino workspace`  
**Upstream Container Directory:** `t3-core/`  

---

## Executive Differential Metrics

| Metric | Count | Description |
| :--- | :---: | :--- |
| **Identical Files** | **1,857** | Files in `t3-core` byte-for-byte identical to upstream base SHA |
| **Modified Files** | **184** | Files in `t3-core` with modifications (docking ports, integrations, syncs) |
| **Added Files (Total)** | **81** | Files added in Embedino (Hardware modules, atoms, root configs, synced features) |
| ↳ *Added in Workspace Root* | *23* | `AGENTS.md`, `PATCH.md`, `regraft.json`, `usb_devices.json`, etc. |
| ↳ *Added in `t3-core/`* | *58* | Dedicated hardware/toolchain code and synced components |
| **Pruned / Deleted Files** | **13,879** | Upstream files excluded or removed (`apps/mobile/**`, `docs/`, `infra/`, `.repos/`) |

---

## 1. Categorized Breakdown of Modified Files

Following Embedino's **95/5 Modular Isolation Principle** (`AGENTS.md`), upstream modifications are strictly constrained to minimal 'thin docking ports' and necessary context pipelines.

### Backend Integration (Orchestration & Provider Layers) (13 files, +212 / -97 lines)

| File Path | Local Lines | Upstream Lines | Diff (+/-) | Role & Architectural Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `t3-core/apps/server/src/orchestration/Layers/ProviderCommandReactor.ts` | 1464 | 1453 | +11 / -0 | Hardware context propagation (activeToolchain, activeDeviceId) to AI providers and decider |
| `t3-core/apps/server/src/orchestration/Layers/ProviderRuntimeIngestion.ts` | 2127 | 2071 | +56 / -0 | Hardware context propagation (activeToolchain, activeDeviceId) to AI providers and decider |
| `t3-core/apps/server/src/orchestration/decider.ts` | 1408 | 1402 | +6 / -0 | Hardware context propagation (activeToolchain, activeDeviceId) to AI providers and decider |
| `t3-core/apps/server/src/provider/CodexDeveloperInstructions.ts` | 180 | 172 | +10 / -2 | Hardware context propagation (activeToolchain, activeDeviceId) to AI providers and decider |
| `t3-core/apps/server/src/provider/Layers/ClaudeAdapter.test.ts` | 4366 | 4369 | +5 / -8 | Hardware context propagation (activeToolchain, activeDeviceId) to AI providers and decider |
| `t3-core/apps/server/src/provider/Layers/ClaudeAdapter.ts` | 4598 | 4591 | +7 / -0 | Hardware context propagation (activeToolchain, activeDeviceId) to AI providers and decider |
| `t3-core/apps/server/src/provider/Layers/CodexAdapter.test.ts` | 1301 | 1305 | +8 / -12 | Hardware context propagation (activeToolchain, activeDeviceId) to AI providers and decider |
| `t3-core/apps/server/src/provider/Layers/CodexAdapter.ts` | 2004 | 1997 | +9 / -2 | Hardware context propagation (activeToolchain, activeDeviceId) to AI providers and decider |
| `t3-core/apps/server/src/provider/Layers/CursorAdapter.ts` | 1189 | 1182 | +9 / -2 | Hardware context propagation (activeToolchain, activeDeviceId) to AI providers and decider |
| `t3-core/apps/server/src/provider/Layers/GrokAdapter.test.ts` | 1209 | 1200 | +57 / -48 | Hardware context propagation (activeToolchain, activeDeviceId) to AI providers and decider |
| `t3-core/apps/server/src/provider/Layers/GrokAdapter.ts` | 1470 | 1464 | +7 / -1 | Hardware context propagation (activeToolchain, activeDeviceId) to AI providers and decider |
| `t3-core/apps/server/src/provider/Layers/OpenCodeAdapter.test.ts` | 1376 | 1377 | +20 / -21 | Hardware context propagation (activeToolchain, activeDeviceId) to AI providers and decider |
| `t3-core/apps/server/src/provider/Layers/OpenCodeAdapter.ts` | 1727 | 1721 | +7 / -1 | Hardware context propagation (activeToolchain, activeDeviceId) to AI providers and decider |

### Build & Workspace Configuration (4 files, +508 / -19 lines)

| File Path | Local Lines | Upstream Lines | Diff (+/-) | Role & Architectural Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `t3-core/package.json` | 67 | 65 | +3 / -1 | Desktop build packaging, smoke test, and monorepo workspace dependencies |
| `t3-core/pnpm-workspace.yaml` | 142 | 152 | +0 / -10 | Desktop build packaging, smoke test, and monorepo workspace dependencies |
| `t3-core/scripts/build-desktop-artifact.test.ts` | 855 | 769 | +86 / -0 | Desktop build packaging, smoke test, and monorepo workspace dependencies |
| `t3-core/scripts/build-desktop-artifact.ts` | 2568 | 2157 | +419 / -8 | Desktop build packaging, smoke test, and monorepo workspace dependencies |

### Contracts Enhancement (Orchestration & Provider Schemas) (2 files, +10 / -0 lines)

| File Path | Local Lines | Upstream Lines | Diff (+/-) | Role & Architectural Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `t3-core/packages/contracts/src/orchestration.ts` | 1732 | 1725 | +7 / -0 | Adding activeToolchain and activeDeviceId to turn start request and provider payloads |
| `t3-core/packages/contracts/src/provider.ts` | 134 | 131 | +3 / -0 | Adding activeToolchain and activeDeviceId to turn start request and provider payloads |

### Docking Port / UI Enhancement (Chat View & Header) (2 files, +212 / -19 lines)

| File Path | Local Lines | Upstream Lines | Diff (+/-) | Role & Architectural Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `t3-core/apps/web/src/components/ChatView.tsx` | 6777 | 6598 | +198 / -19 | Chat header board selector integration and active hardware/toolchain context injection |
| `t3-core/apps/web/src/components/chat/ChatHeader.tsx` | 355 | 341 | +14 / -0 | Chat header board selector integration and active hardware/toolchain context injection |

### Other Modified Upstream File (108 files, +5353 / -13934 lines)

| File Path | Local Lines | Upstream Lines | Diff (+/-) | Role & Architectural Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `t3-core/AGENTS.md` | 168 | 148 | +124 / -104 | Upstream component update / sync |
| `t3-core/apps/desktop/src/preview/AnnotationStyles.generated.ts` | 3 | 3 | +1 / -1 | Upstream component update / sync |
| `t3-core/apps/desktop/src/preview/Manager.test.ts` | 2675 | 2071 | +604 / -0 | Upstream component update / sync |
| `t3-core/apps/desktop/src/preview/Manager.ts` | 3930 | 3747 | +204 / -21 | Upstream component update / sync |
| `t3-core/apps/desktop/src/settings/DesktopClientSettings.test.ts` | 222 | 221 | +1 / -0 | Upstream component update / sync |
| `t3-core/apps/desktop/src/wsl/DesktopWslEnvironment.ts` | 891 | 887 | +19 / -15 | Upstream component update / sync |
| `t3-core/apps/server/src/cli/connect.ts` | 718 | 717 | +3 / -2 | Upstream component update / sync |
| `t3-core/apps/server/src/cloud/CliTokenManager.ts` | 493 | 491 | +9 / -7 | Upstream component update / sync |
| `t3-core/apps/server/src/cloud/config.ts` | 58 | 18 | +40 / -0 | Upstream component update / sync |
| `t3-core/apps/server/src/cloud/publicConfig.test.ts` | 181 | 182 | +1 / -2 | Upstream component update / sync |
| `t3-core/apps/server/src/cloud/publicConfig.ts` | 215 | 205 | +15 / -5 | Upstream component update / sync |
| `t3-core/apps/server/src/environment/ServerEnvironment.test.ts` | 205 | 136 | +70 / -1 | Upstream component update / sync |
| `t3-core/apps/server/src/environment/ServerEnvironment.ts` | 180 | 168 | +14 / -2 | Upstream component update / sync |
| `t3-core/apps/server/src/git/GitManager.test.ts` | 4676 | 4622 | +54 / -0 | Upstream component update / sync |
| `t3-core/apps/server/src/git/GitManager.ts` | 2334 | 2323 | +11 / -0 | Upstream component update / sync |
| `t3-core/apps/server/src/preview/PortScanner.test.ts` | 664 | 157 | +534 / -27 | Upstream component update / sync |
| `t3-core/apps/server/src/preview/PortScanner.ts` | 664 | 390 | +305 / -31 | Upstream component update / sync |
| `t3-core/apps/server/src/relay/AgentAwarenessRelay.ts` | 641 | 640 | +2 / -1 | Upstream component update / sync |
| `t3-core/apps/server/src/sourceControl/GitHubCli.test.ts` | 406 | 376 | +30 / -0 | Upstream component update / sync |
| `t3-core/apps/server/src/sourceControl/GitHubCli.ts` | 478 | 461 | +17 / -0 | Upstream component update / sync |
| `t3-core/apps/server/src/sourceControl/GitLabCli.ts` | 642 | 641 | +1 / -0 | Upstream component update / sync |
| `t3-core/apps/server/src/vcs/VcsProcess.test.ts` | 299 | 274 | +25 / -0 | Upstream component update / sync |
| `t3-core/apps/server/src/vcs/VcsProcess.ts` | 185 | 177 | +8 / -0 | Upstream component update / sync |
| `t3-core/apps/server/vite.config.ts` | 87 | 76 | +20 / -9 | Upstream component update / sync |
| `t3-core/apps/web/src/browser/BrowserDeviceToolbar.tsx` | 344 | 340 | +6 / -2 | Upstream component update / sync |
| `t3-core/apps/web/src/browser/browserTargetResolver.test.ts` | 314 | 183 | +131 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/browser/browserTargetResolver.ts` | 250 | 142 | +122 / -14 | Upstream component update / sync |
| `t3-core/apps/web/src/cloud/connectCliAuth.test.ts` | 85 | 69 | +16 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/cloud/connectCliAuth.ts` | 100 | 91 | +10 / -1 | Upstream component update / sync |
| `t3-core/apps/web/src/cloud/managedRelayState.ts` | 123 | 101 | +22 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/components/AppSidebarLayout.tsx` | 245 | 234 | +14 / -3 | Upstream component update / sync |
| `t3-core/apps/web/src/components/ChatMarkdown.tsx` | 1721 | 1720 | +2 / -1 | Upstream component update / sync |
| `t3-core/apps/web/src/components/CommandPalette.logic.test.ts` | 343 | 329 | +14 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/components/CommandPalette.logic.ts` | 426 | 412 | +16 / -2 | Upstream component update / sync |
| `t3-core/apps/web/src/components/CommandPalette.tsx` | 2428 | 2381 | +48 / -1 | Upstream component update / sync |
| `t3-core/apps/web/src/components/CommandPaletteResults.tsx` | 219 | 219 | +2 / -2 | Upstream component update / sync |
| `t3-core/apps/web/src/components/LegacySidebar.tsx` | 3702 | 3697 | +9 / -4 | Upstream component update / sync |
| `t3-core/apps/web/src/components/RightPanelTabs.tsx` | 769 | 610 | +231 / -72 | Upstream component update / sync |
| `t3-core/apps/web/src/components/Sidebar.logic.test.ts` | 1657 | 1635 | +22 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/components/Sidebar.logic.ts` | 954 | 936 | +18 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/components/Sidebar.tsx` | 3788 | 3772 | +33 / -17 | Upstream component update / sync |
| `t3-core/apps/web/src/components/SidebarStageBackdrop.tsx` | 397 | 397 | +8 / -8 | Upstream component update / sync |
| `t3-core/apps/web/src/components/chat/ChangedFilesTree.test.tsx` | 242 | 234 | +8 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/components/chat/ChangedFilesTree.tsx` | 331 | 331 | +6 / -6 | Upstream component update / sync |
| `t3-core/apps/web/src/components/chat/DraftHeroHeadline.tsx` | 164 | 161 | +3 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/components/chat/MessagesTimeline.tsx` | 2453 | 2383 | +90 / -20 | Upstream component update / sync |
| `t3-core/apps/web/src/components/chat/PanelLayoutControls.tsx` | 135 | 135 | +4 / -4 | Upstream component update / sync |
| `t3-core/apps/web/src/components/chat/externalLinkContextMenu.test.ts` | 147 | 128 | +19 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/components/chat/externalLinkContextMenu.ts` | 95 | 78 | +18 / -1 | Upstream component update / sync |
| `t3-core/apps/web/src/components/clerk/MobileClientsUserProfilePage.tsx` | 155 | 166 | +52 / -63 | Upstream component update / sync |
| `t3-core/apps/web/src/components/clerk/T3ConnectSidebarSignIn.tsx` | 73 | 65 | +9 / -1 | Upstream component update / sync |
| `t3-core/apps/web/src/components/cloud/ConnectCliAuthSurface.tsx` | 198 | 192 | +9 / -3 | Upstream component update / sync |
| `t3-core/apps/web/src/components/desktopUpdate.toast.tsx` | 59 | 55 | +6 / -2 | Upstream component update / sync |
| `t3-core/apps/web/src/components/diffs/StyledDiffCodeView.test.tsx` | 58 | 58 | +1 / -1 | Upstream component update / sync |
| `t3-core/apps/web/src/components/diffs/StyledDiffCodeView.tsx` | 322 | 309 | +16 / -3 | Upstream component update / sync |
| `t3-core/apps/web/src/components/preview/PreviewEmptyState.test.tsx` | 92 | 89 | +6 / -3 | Upstream component update / sync |
| `t3-core/apps/web/src/components/preview/PreviewEmptyState.tsx` | 95 | 94 | +8 / -7 | Upstream component update / sync |
| `t3-core/apps/web/src/components/preview/PreviewLocalServerCard.tsx` | 34 | 52 | +7 / -25 | Upstream component update / sync |
| `t3-core/apps/web/src/components/preview/PreviewMoreMenu.tsx` | 189 | 188 | +1 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/components/preview/PreviewPanelShell.test.ts` | 23 | 13 | +11 / -1 | Upstream component update / sync |
| `t3-core/apps/web/src/components/preview/PreviewPanelShell.tsx` | 97 | 97 | +1 / -1 | Upstream component update / sync |
| `t3-core/apps/web/src/components/preview/PreviewRecentUrlCard.tsx` | 53 | 51 | +5 / -3 | Upstream component update / sync |
| `t3-core/apps/web/src/components/preview/PreviewView.tsx` | 749 | 749 | +1 / -1 | Upstream component update / sync |
| `t3-core/apps/web/src/components/preview/useDiscoveredLocalServers.test.ts` | 146 | 139 | +64 / -57 | Upstream component update / sync |
| `t3-core/apps/web/src/components/preview/useDiscoveredLocalServers.ts` | 105 | 146 | +24 / -65 | Upstream component update / sync |
| `t3-core/apps/web/src/components/preview/usePreviewBridge.ts` | 192 | 154 | +52 / -14 | Upstream component update / sync |
| `t3-core/apps/web/src/components/settings/SourceControlSettings.tsx` | 603 | 593 | +14 / -4 | Upstream component update / sync |
| `t3-core/apps/web/src/components/settings/settingsLayout.tsx` | 268 | 267 | +1 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/components/settings/settingsSearch.ts` | 240 | 235 | +5 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/components/ui/alert-dialog.tsx` | 146 | 144 | +3 / -1 | Upstream component update / sync |
| `t3-core/apps/web/src/components/ui/tooltip.tsx` | 64 | 64 | +1 / -1 | Upstream component update / sync |
| `t3-core/apps/web/src/composerDraftStore.test.ts` | 1862 | 1806 | +56 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/composerDraftStore.ts` | 3767 | 3701 | +66 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/hooks/useHandleNewThread.ts` | 473 | 440 | +33 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/hooks/useTheme.ts` | 637 | 633 | +4 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/hooks/useThreadActionMenu.ts` | 313 | 310 | +3 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/lib/favicon.ts` | 23 | 20 | +3 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/main.tsx` | 55 | 50 | +7 / -2 | Upstream component update / sync |
| `t3-core/apps/web/src/portDiscoveryState.ts` | 106 | 51 | +58 / -3 | Upstream component update / sync |
| `t3-core/apps/web/src/previewStateStore.test.ts` | 579 | 575 | +4 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/previewStateStore.ts` | 469 | 467 | +2 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/rightPanelStore.test.ts` | 698 | 576 | +122 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/rightPanelStore.ts` | 706 | 669 | +40 / -3 | Upstream component update / sync |
| `t3-core/apps/web/src/routeTree.gen.ts` | 455 | 455 | +194 / -194 | Upstream component update / sync |
| `t3-core/apps/web/src/routes/_chat.index.tsx` | 185 | 185 | +1 / -1 | Upstream component update / sync |
| `t3-core/apps/web/src/rpc/requestLatencyState.test.ts` | 110 | 100 | +10 / -0 | Upstream component update / sync |
| `t3-core/apps/web/src/rpc/requestLatencyState.ts` | 162 | 158 | +5 / -1 | Upstream component update / sync |
| `t3-core/apps/web/src/state/query.ts` | 36 | 36 | +2 / -2 | Upstream component update / sync |
| `t3-core/apps/web/src/versionSkew.test.ts` | 110 | 110 | +1 / -1 | Upstream component update / sync |
| `t3-core/apps/web/src/versionSkew.ts` | 147 | 147 | +1 / -1 | Upstream component update / sync |
| `t3-core/packages/client-runtime/src/relay/managedRelayState.test.ts` | 424 | 381 | +48 / -5 | Upstream component update / sync |
| `t3-core/packages/client-runtime/src/relay/managedRelayState.ts` | 469 | 450 | +19 / -0 | Upstream component update / sync |
| `t3-core/packages/client-runtime/src/state/preview.ts` | 116 | 113 | +3 / -0 | Upstream component update / sync |
| `t3-core/packages/client-runtime/src/state/threadSettled.test.ts` | 473 | 439 | +34 / -0 | Upstream component update / sync |
| `t3-core/packages/client-runtime/src/state/threadSettled.ts` | 394 | 385 | +15 / -6 | Upstream component update / sync |
| `t3-core/packages/contracts/src/environment.ts` | 137 | 131 | +6 / -0 | Upstream component update / sync |
| `t3-core/packages/contracts/src/environmentHttp.ts` | 615 | 591 | +24 / -0 | Upstream component update / sync |
| `t3-core/packages/contracts/src/ipc.ts` | 1329 | 1305 | +24 / -0 | Upstream component update / sync |
| `t3-core/packages/contracts/src/preview.test.ts` | 364 | 344 | +20 / -0 | Upstream component update / sync |
| `t3-core/packages/contracts/src/preview.ts` | 314 | 306 | +9 / -1 | Upstream component update / sync |
| `t3-core/packages/contracts/src/settings.test.ts` | 309 | 299 | +11 / -1 | Upstream component update / sync |
| `t3-core/packages/contracts/src/settings.ts` | 808 | 806 | +2 / -0 | Upstream component update / sync |
| `t3-core/packages/contracts/src/vcs.ts` | 283 | 280 | +10 / -7 | Upstream component update / sync |
| `t3-core/packages/shared/src/connectAuth.test.ts` | 104 | 78 | +26 / -0 | Upstream component update / sync |
| `t3-core/packages/shared/src/connectAuth.ts` | 170 | 124 | +50 / -4 | Upstream component update / sync |
| `t3-core/pnpm-lock.yaml` | 9887 | 21789 | +1156 / -13058 | Upstream component update / sync |
| `t3-core/tsconfig.base.json` | 60 | 58 | +2 / -0 | Upstream component update / sync |
| `t3-core/vite.config.ts` | 131 | 132 | +1 / -2 | Upstream component update / sync |

### Thin Docking Port (Client Runtime Tagging) (1 files, +5 / -2 lines)

| File Path | Local Lines | Upstream Lines | Diff (+/-) | Role & Architectural Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `t3-core/packages/client-runtime/src/rpc/client.ts` | 301 | 298 | +5 / -2 | Registers hardware stream / environment tags in client RPC |

### Thin Docking Port (Contract RPC Endpoints) (1 files, +99 / -2 lines)

| File Path | Local Lines | Upstream Lines | Diff (+/-) | Role & Architectural Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `t3-core/packages/contracts/src/rpc.ts` | 1142 | 1045 | +99 / -2 | Effect RPC endpoint contracts defining toolchain and hardware operations |

### Thin Docking Port (Contracts Re-export) (1 files, +2 / -0 lines)

| File Path | Local Lines | Upstream Lines | Diff (+/-) | Role & Architectural Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `t3-core/packages/contracts/src/index.ts` | 35 | 33 | +2 / -0 | Re-export of hardware and toolchain contract modules |

### Thin Docking Port (Server RPC Auth Mapping) (1 files, +9 / -0 lines)

| File Path | Local Lines | Upstream Lines | Diff (+/-) | Role & Architectural Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `t3-core/apps/server/src/auth/RpcAuthorization.ts` | 143 | 134 | +9 / -0 | Hardware and toolchain RPC authorization handler mapping |

### Thin Docking Port (Server RPC Registration) (1 files, +65 / -7 lines)

| File Path | Local Lines | Upstream Lines | Diff (+/-) | Role & Architectural Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `t3-core/apps/server/src/ws.ts` | 2388 | 2330 | +65 / -7 | Server WebSocket entrypoint registering hardware and toolchain RPC routes (95/5 rule) |

### Thin Docking Port (UI Navigation) (1 files, +11 / -6 lines)

| File Path | Local Lines | Upstream Lines | Diff (+/-) | Role & Architectural Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `t3-core/apps/web/src/components/sidebar/SidebarChrome.tsx` | 231 | 226 | +11 / -6 | Mounting ToolchainSetupPill into sidebar navigation |

### Thin Docking Port (UI Settings) (1 files, +80 / -1 lines)

| File Path | Local Lines | Upstream Lines | Diff (+/-) | Role & Architectural Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `t3-core/apps/web/src/components/settings/SettingsPanels.tsx` | 2616 | 2537 | +80 / -1 | Mounting Active Build Toolchain settings row in Settings panels |

### Thin Docking Port (UI Toolbar) (1 files, +16 / -14 lines)

| File Path | Local Lines | Upstream Lines | Diff (+/-) | Role & Architectural Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `t3-core/apps/web/src/components/BranchToolbar.tsx` | 541 | 539 | +16 / -14 | Mounting BoardSelectorPill into top branch toolbar |

### UI Styling (1 files, +67 / -59 lines)

| File Path | Local Lines | Upstream Lines | Diff (+/-) | Role & Architectural Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `t3-core/apps/web/src/index.css` | 2326 | 2318 | +67 / -59 | Embedino custom styling and toolchain/hardware dialog styles |

### Upstream Divergence / PR Feature Sync (46 files, +9410 / -617 lines)

| File Path | Local Lines | Upstream Lines | Diff (+/-) | Role & Architectural Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `t3-core/apps/server/src/pullRequest/AzureDevOpsPullRequestCli.test.ts` | 613 | 507 | +106 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/AzureDevOpsPullRequestCli.ts` | 527 | 487 | +40 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.test.ts` | 29 | 21 | +9 / -1 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/AzureDevOpsPullRequestProvider.ts` | 272 | 246 | +27 / -1 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/BitbucketPullRequestApi.test.ts` | 942 | 874 | +68 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/BitbucketPullRequestApi.ts` | 832 | 785 | +47 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/BitbucketPullRequestProvider.ts` | 325 | 290 | +35 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/GitHubPullRequestCli.test.ts` | 2400 | 1772 | +629 / -1 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/GitHubPullRequestCli.ts` | 1869 | 1473 | +411 / -15 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/GitHubPullRequestProvider.test.ts` | 450 | 222 | +230 / -2 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/GitHubPullRequestProvider.ts` | 487 | 352 | +145 / -10 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/GitLabPullRequestCli.test.ts` | 1400 | 1144 | +256 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/GitLabPullRequestCli.ts` | 1374 | 1153 | +241 / -20 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/GitLabPullRequestProvider.test.ts` | 197 | 40 | +161 / -4 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/GitLabPullRequestProvider.ts` | 320 | 219 | +108 / -7 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/PullRequestProvider.ts` | 464 | 387 | +77 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/PullRequestService.test.ts` | 3294 | 2372 | +923 / -1 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/PullRequestService.ts` | 2013 | 1740 | +323 / -50 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/azureDevOpsPullRequestJson.test.ts` | 315 | 300 | +15 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/azureDevOpsPullRequestJson.ts` | 342 | 333 | +9 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/bitbucketPullRequestJson.test.ts` | 376 | 360 | +16 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/bitbucketPullRequestJson.ts` | 628 | 614 | +20 / -6 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/gitHubPullRequestJson.test.ts` | 1339 | 959 | +380 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/gitHubPullRequestJson.ts` | 2206 | 1590 | +642 / -26 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/gitLabMergeRequestJson.test.ts` | 610 | 455 | +155 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/gitLabMergeRequestJson.ts` | 940 | 698 | +242 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/PullRequestCodeTab.tsx` | 1326 | 1235 | +102 / -11 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/PullRequestDetailPanel.tsx` | 1904 | 1414 | +554 / -64 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/PullRequestListFilters.test.tsx` | 181 | 99 | +88 / -6 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/PullRequestListFilters.tsx` | 416 | 288 | +153 / -25 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/PullRequestReviewAnnotation.tsx` | 304 | 236 | +75 / -7 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/PullRequestRow.tsx` | 140 | 97 | +51 / -8 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/PullRequestSummaryTab.tsx` | 793 | 463 | +359 / -29 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/PullRequestTimelineTab.tsx` | 484 | 365 | +125 / -6 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestDetail.logic.test.ts` | 939 | 789 | +155 / -5 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestDetail.logic.ts` | 764 | 650 | +114 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestList.logic.test.ts` | 1017 | 445 | +591 / -19 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestList.logic.ts` | 797 | 379 | +470 / -52 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestPresentation.tsx` | 316 | 269 | +47 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/lib/openPullRequestLink.test.ts` | 211 | 199 | +12 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/lib/openPullRequestLink.ts` | 293 | 265 | +43 / -15 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/routes/_chat.pull-requests.tsx` | 1926 | 1498 | +653 / -225 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/apps/web/src/state/pullRequests.ts` | 129 | 5 | +124 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/packages/client-runtime/src/state/pullRequests.ts` | 176 | 158 | +18 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/packages/contracts/src/pullRequest.test.ts` | 232 | 155 | +77 / -0 | Pull Request feature updates synced from upstream T3 Code |
| `t3-core/packages/contracts/src/pullRequest.ts` | 1083 | 800 | +284 / -1 | Pull Request feature updates synced from upstream T3 Code |

---

## 2. Categorized Breakdown of Added Files

These files represent dedicated Embedino functionality (the 95% of custom code) that lives in isolated directories to prevent merge conflicts during upstream pulls.

### Backend Hardware Engine (Server) (4 files, 1,096 total lines)

| File Path | Line Count | Description |
| :--- | :---: | :--- |
| `t3-core/apps/server/src/hardware/BoardDatabase.ts` | 568 | Cross-platform USB/Serial scanning (DeviceService), VID/PID database (BoardDatabase), device association store |
| `t3-core/apps/server/src/hardware/DeviceAssociationStore.ts` | 75 | Cross-platform USB/Serial scanning (DeviceService), VID/PID database (BoardDatabase), device association store |
| `t3-core/apps/server/src/hardware/DeviceService.ts` | 326 | Cross-platform USB/Serial scanning (DeviceService), VID/PID database (BoardDatabase), device association store |
| `t3-core/apps/server/src/hardware/HardwareAgentPrompt.ts` | 127 | Cross-platform USB/Serial scanning (DeviceService), VID/PID database (BoardDatabase), device association store |

### Backend Toolchain Engine (Server) (1 files, 689 total lines)

| File Path | Line Count | Description |
| :--- | :---: | :--- |
| `t3-core/apps/server/src/toolchain/ToolchainService.ts` | 689 | Toolchain detection (PlatformIO, Arduino CLI, native toolchains) via binary & filesystem checks |

### Build Artifact (TS Build Info) (4 files, 4 total lines)

| File Path | Line Count | Description |
| :--- | :---: | :--- |
| `t3-core/apps/desktop/tsconfig.tsbuildinfo` | 1 | TypeScript incremental build cache info |
| `t3-core/apps/web/tsconfig.tsbuildinfo` | 1 | TypeScript incremental build cache info |
| `t3-core/oxlint-plugin-t3code/tsconfig.tsbuildinfo` | 1 | TypeScript incremental build cache info |
| `t3-core/scripts/tsconfig.tsbuildinfo` | 1 | TypeScript incremental build cache info |

### CI / CD Workflows (14 files, 3,049 total lines)

| File Path | Line Count | Description |
| :--- | :---: | :--- |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | 118 | GitHub Actions CI/CD workflows and automated checks |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | 102 | GitHub Actions CI/CD workflows and automated checks |
| `.github/VOUCHED.td` | 40 | GitHub Actions CI/CD workflows and automated checks |
| `.github/pull_request_template.md` | 33 | GitHub Actions CI/CD workflows and automated checks |
| `.github/scripts/thread-transfer-report.cjs` | 429 | GitHub Actions CI/CD workflows and automated checks |
| `.github/scripts/thread-transfer-report.test.cjs` | 292 | GitHub Actions CI/CD workflows and automated checks |
| `.github/workflows/ci.yml` | 58 | GitHub Actions CI/CD workflows and automated checks |
| `.github/workflows/deploy-relay.yml` | 87 | GitHub Actions CI/CD workflows and automated checks |
| `.github/workflows/issue-labels.yml` | 75 | GitHub Actions CI/CD workflows and automated checks |
| `.github/workflows/pr-size.yml` | 295 | GitHub Actions CI/CD workflows and automated checks |
| `.github/workflows/pr-vouch.yml` | 199 | GitHub Actions CI/CD workflows and automated checks |
| `.github/workflows/release.yml` | 1114 | GitHub Actions CI/CD workflows and automated checks |
| `.github/workflows/thread-transfer-report.yml` | 75 | GitHub Actions CI/CD workflows and automated checks |
| `.github/workflows/web-preview.yml` | 132 | GitHub Actions CI/CD workflows and automated checks |

### Contracts & Schemas (Hardware & Toolchain) (2 files, 154 total lines)

| File Path | Line Count | Description |
| :--- | :---: | :--- |
| `t3-core/packages/contracts/src/hardware/devices.ts` | 122 | Dedicated Effect TS schemas for hardware devices, toolchain status, install progress events |
| `t3-core/packages/contracts/src/toolchain.ts` | 32 | Dedicated Effect TS schemas for hardware devices, toolchain status, install progress events |

### Embedino Workspace Root Configuration (8 files, 22,473 total lines)

| File Path | Line Count | Description |
| :--- | :---: | :--- |
| `AGENTS.md` | 175 | Embedino architecture documentation, Regraft configuration, USB vendor/product ID database, and branding |
| `CHANGELOG.md` | 35 | Embedino architecture documentation, Regraft configuration, USB vendor/product ID database, and branding |
| `LICENSE` | 21 | Embedino architecture documentation, Regraft configuration, USB vendor/product ID database, and branding |
| `PATCH.md` | 284 | Embedino architecture documentation, Regraft configuration, USB vendor/product ID database, and branding |
| `README.md` | 76 | Embedino architecture documentation, Regraft configuration, USB vendor/product ID database, and branding |
| `logo.svg` | 11 | Embedino architecture documentation, Regraft configuration, USB vendor/product ID database, and branding |
| `regraft.json` | 20963 | Embedino architecture documentation, Regraft configuration, USB vendor/product ID database, and branding |
| `usb_devices.json` | 908 | Embedino architecture documentation, Regraft configuration, USB vendor/product ID database, and branding |

### Frontend Reactive State (Web) (2 files, 322 total lines)

| File Path | Line Count | Description |
| :--- | :---: | :--- |
| `t3-core/apps/web/src/state/hardware.ts` | 190 | Reactive Effect atoms and store for connected hardware devices and toolchain status |
| `t3-core/apps/web/src/state/toolchain.ts` | 132 | Reactive Effect atoms and store for connected hardware devices and toolchain status |

### Frontend UI Components (Hardware) (3 files, 484 total lines)

| File Path | Line Count | Description |
| :--- | :---: | :--- |
| `t3-core/apps/web/src/components/hardware/BoardNamingDialog.tsx` | 94 | BoardSelectorPill, BoardSelectorPopover, BoardNamingDialog, DeviceDetails components |
| `t3-core/apps/web/src/components/hardware/BoardSelectorPill.tsx` | 95 | BoardSelectorPill, BoardSelectorPopover, BoardNamingDialog, DeviceDetails components |
| `t3-core/apps/web/src/components/hardware/BoardSelectorPopover.tsx` | 295 | BoardSelectorPill, BoardSelectorPopover, BoardNamingDialog, DeviceDetails components |

### Frontend UI Components (Wiring & Toolchain) (1 files, 441 total lines)

| File Path | Line Count | Description |
| :--- | :---: | :--- |
| `t3-core/apps/web/src/components/wiring/ToolchainSetup.tsx` | 441 | ToolchainSetup dialog, interactive wiring canvas and component visualizers |

### Other Dedicated Embedino Module (10 files, 997 total lines)

| File Path | Line Count | Description |
| :--- | :---: | :--- |
| `.gitignore` | 140 | Custom extension module for Embedino |
| `t3-core/ORIGINAL_REQUEST.md` | 34 | Custom extension module for Embedino |
| `t3-core/apps/web/src/components/RightPanelTabs.test.tsx` | 115 | Custom extension module for Embedino |
| `t3-core/apps/web/src/components/ThreadCommandSubtitle.tsx` | 112 | Custom extension module for Embedino |
| `t3-core/apps/web/src/components/preview/usePreviewBridge.test.ts` | 48 | Custom extension module for Embedino |
| `t3-core/apps/web/src/portDiscoveryState.test.ts` | 35 | Custom extension module for Embedino |
| `t3-core/apps/web/src/routes/-chatIndexTitlebar.test.ts` | 20 | Custom extension module for Embedino |
| `t3-core/packages/contracts/src/environmentHttp.test.ts` | 62 | Custom extension module for Embedino |
| `t3-core/scripts/lib/cli-external-packages.test.ts` | 275 | Custom extension module for Embedino |
| `t3-core/scripts/lib/cli-external-packages.ts` | 156 | Custom extension module for Embedino |

### Upstream Sync Feature (Clerk User Profile) (5 files, 534 total lines)

| File Path | Line Count | Description |
| :--- | :---: | :--- |
| `t3-core/apps/web/src/components/clerk/ClerkUserProfilePage.tsx` | 86 | Clerk user profile and appearance handling |
| `t3-core/apps/web/src/components/clerk/T3ConnectUserProfilePage.test.tsx` | 63 | Clerk user profile and appearance handling |
| `t3-core/apps/web/src/components/clerk/T3ConnectUserProfilePage.tsx` | 260 | Clerk user profile and appearance handling |
| `t3-core/apps/web/src/components/clerk/clerkAppearance.test.ts` | 91 | Clerk user profile and appearance handling |
| `t3-core/apps/web/src/components/clerk/clerkAppearance.ts` | 34 | Clerk user profile and appearance handling |

### Upstream Sync Feature (Favicon System) (9 files, 2,820 total lines)

| File Path | Line Count | Description |
| :--- | :---: | :--- |
| `t3-core/apps/desktop/src/preview/FaviconCapture.test.ts` | 999 | Favicon discovery and caching system synced from upstream T3 Code |
| `t3-core/apps/desktop/src/preview/FaviconCapture.ts` | 679 | Favicon discovery and caching system synced from upstream T3 Code |
| `t3-core/apps/web/src/browserFaviconLogic.test.ts` | 124 | Favicon discovery and caching system synced from upstream T3 Code |
| `t3-core/apps/web/src/browserFaviconLogic.ts` | 201 | Favicon discovery and caching system synced from upstream T3 Code |
| `t3-core/apps/web/src/browserFaviconStore.test.ts` | 316 | Favicon discovery and caching system synced from upstream T3 Code |
| `t3-core/apps/web/src/browserFaviconStore.ts` | 342 | Favicon discovery and caching system synced from upstream T3 Code |
| `t3-core/apps/web/src/components/preview/PreviewFaviconIcon.test.tsx` | 51 | Favicon discovery and caching system synced from upstream T3 Code |
| `t3-core/apps/web/src/components/preview/PreviewFaviconIcon.tsx` | 66 | Favicon discovery and caching system synced from upstream T3 Code |
| `t3-core/apps/web/src/lib/favicon.test.ts` | 42 | Favicon discovery and caching system synced from upstream T3 Code |

### Upstream Sync Feature (Pull Requests) (18 files, 2,099 total lines)

| File Path | Line Count | Description |
| :--- | :---: | :--- |
| `t3-core/apps/server/src/pullRequest/pullRequestChecks.test.ts` | 93 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/server/src/pullRequest/pullRequestChecks.ts` | 55 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/PullRequestChecksPopover.tsx` | 134 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/PullRequestMarkdownEditor.tsx` | 113 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/PullRequestReactions.tsx` | 178 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestChecks.test.tsx` | 85 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestEditing.logic.test.ts` | 172 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestEditing.logic.ts` | 41 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestFileOrder.logic.test.ts` | 167 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestFileOrder.logic.ts` | 197 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestLinkContextMenu.test.ts` | 20 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestLinkContextMenu.ts` | 68 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestProjectAssignment.logic.test.ts` | 259 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestProjectAssignment.logic.ts` | 130 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestReactions.logic.test.ts` | 210 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestReactions.logic.ts` | 108 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestSummaryScroll.logic.test.ts` | 49 | Pull request management component synced from upstream T3 Code |
| `t3-core/apps/web/src/components/pullRequest/pullRequestSummaryScroll.logic.ts` | 20 | Pull request management component synced from upstream T3 Code |

---

## 3. Pruned and Excluded Upstream Folders

Embedino uses `regraft.json` to prune unused upstream components (e.g. mobile applications, marketing, cloud infra) to focus strictly on desktop & embedded workflows.

| Upstream Directory / Scope | File Count | Pruning Rationale |
| :--- | :---: | :--- |
| `.repos/` | 12,961 | Upstream repo cache and submodules excluded from graft tracking |
| `apps/` | 720 | Pruned `apps/mobile` (React Native / iOS / Android app) as Embedino targets desktop/web embedded IDE |
| `infra/` | 78 | Upstream cloud infrastructure and deployment scripts excluded |
| `.plans/` | 32 | Upstream internal IDE configs and draft plans excluded from Embedino |
| `docs/` | 31 | Upstream website and docs pruned |
| `.github/` | 18 | Excluded to maintain lightweight embedded desktop focus |
| `.agents/` | 11 | Excluded to maintain lightweight embedded desktop focus |
| `root_files/` | 10 | Upstream repository root files replaced by Embedino workspace root files |
| `scripts/` | 6 | Excluded to maintain lightweight embedded desktop focus |
| `experiments/` | 3 | Excluded to maintain lightweight embedded desktop focus |
| `.cursor/` | 2 | Upstream internal IDE configs and draft plans excluded from Embedino |
| `.vscode/` | 2 | Upstream internal IDE configs and draft plans excluded from Embedino |
| `.claude/` | 1 | Upstream internal IDE configs and draft plans excluded from Embedino |
| `.codex/` | 1 | Upstream internal IDE configs and draft plans excluded from Embedino |
| `.devcontainer/` | 1 | Upstream internal IDE configs and draft plans excluded from Embedino |
| `.macroscope/` | 1 | Upstream internal IDE configs and draft plans excluded from Embedino |
| `.vite-hooks/` | 1 | Excluded to maintain lightweight embedded desktop focus |

---

## 4. Deep-Dive: Thin Docking Ports Verification against `AGENTS.md`

Section 4 of `AGENTS.md` defines the approved thin docking ports for Embedino:

1. **`packages/contracts/src/index.ts`** — Re-exports `toolchain.ts` and `hardware/devices.ts`.
2. **`packages/contracts/src/rpc.ts`** — Defines RPC schemas (`ToolchainInstall*`, `Hardware*`).
3. **`packages/client-runtime/src/rpc/client.ts`** — Registers `EnvironmentStreamCommandRpcTag` / hardware subscription tag.
4. **`apps/server/src/ws.ts`** — Registers toolchain and hardware WebSocket RPC handlers.
5. **`apps/server/src/auth/RpcAuthorization.ts`** — Maps authorization for hardware and toolchain RPC endpoints.
6. **`apps/web/src/components/sidebar/SidebarChrome.tsx`** — Renders `<ToolchainSetupPill />`.
7. **`apps/web/src/components/BranchToolbar.tsx`** — Renders `<BoardSelectorPill />`.
8. **`apps/web/src/components/settings/SettingsPanels.tsx`** — Renders Active Build Toolchain settings row.

### Docking Port Diff Details

#### `t3-core/packages/contracts/src/index.ts` (+2 / -0)
```diff
--- upstream/packages/contracts/src/index.ts
+++ embedino/t3-core/packages/contracts/src/index.ts
@@ -30,4 +30,6 @@
 export * from "./previewAutomation.ts";
 export * from "./resourceTelemetry.ts";
 export * from "./usage.ts";
+export * from "./toolchain.ts";
+export * from "./hardware/devices.ts";
 export * from "./rpc.ts";
```

#### `t3-core/packages/contracts/src/rpc.ts` (+99 / -2)
```diff
--- upstream/packages/contracts/src/rpc.ts
+++ embedino/t3-core/packages/contracts/src/rpc.ts
@@ -71,6 +71,7 @@
   PullRequestActionInput,
   PullRequestActivity,
   PullRequestCommentInput,
+  PullRequestCommentUpdateInput,
   PullRequestDetail,
   PullRequestDiffFileContentsInput,
   PullRequestDiffFileContentsResult,
@@ -80,6 +81,7 @@
   PullRequestListStatsInput,
   PullRequestListStatsResult,
   PullRequestOperationError,
+  PullRequestReactionInput,
   PullRequestRef,
   PullRequestReviewerCandidateList,
   PullRequestReviewerRequestInput,
@@ -87,6 +89,7 @@
   PullRequestThreadReplyInput,
   PullRequestThreadResolutionInput,
   PullRequestUnavailableError,
+  PullRequestUpdateInput,
 } from "./pullRequest.ts";
 import {
   RelayClientInstallFailedError,
@@ -126,6 +129,7 @@
 } from "./terminal.ts";
 import {
   DiscoveredLocalServerList,
+  ConfiguredLocalServerUrls,
   PreviewCloseInput,
   PreviewError,
   PreviewEvent,
@@ -186,6 +190,18 @@
   SourceControlRepositoryLookupInput,
 } from "./sourceControl.ts";
 import { VcsError } from "./vcs.ts";
+import {
+  ToolchainInstallError,
+  ToolchainInstallProgressEvent,
+  ToolchainStatus,
+} from "./toolchain.ts";
+import {
+  DeviceAssociationInput,
+  DeviceAssociationResult,
+  HardwareDetectionError,
+  HardwareDevice,
+  HardwareEvent,
+} from "./hardware/devices.ts";
 
 export const WS_METHODS = {
   // Project registry methods
@@ -272,6 +288,16 @@
   cloudGetRelayClientStatus: "cloud.getRelayClientStatus",
   cloudInstallRelayClient: "cloud.installRelayClient",
 
+  // Toolchain methods
+  toolchainInstallPlatformio: "toolchain.installPlatformio",
+  toolchainInstallArduino: "toolchain.installArduino",
... [145 more lines]
```

#### `t3-core/packages/client-runtime/src/rpc/client.ts` (+5 / -2)
```diff
--- upstream/packages/client-runtime/src/rpc/client.ts
+++ embedino/t3-core/packages/client-runtime/src/rpc/client.ts
@@ -52,12 +52,15 @@
   | typeof WS_METHODS.subscribeResourceTelemetry
   | typeof WS_METHODS.previewAutomationConnect
   | typeof WS_METHODS.subscribeVcsStatus
-  | typeof WS_METHODS.terminalAttach;
+  | typeof WS_METHODS.terminalAttach
+  | typeof WS_METHODS.hardwareSubscribeDevices;
 
 export type EnvironmentStreamCommandRpcTag =
   | typeof WS_METHODS.cloudInstallRelayClient
   | typeof WS_METHODS.serverUpdateServerWithProgress
-  | typeof WS_METHODS.gitRunStackedAction;
+  | typeof WS_METHODS.gitRunStackedAction
+  | typeof WS_METHODS.toolchainInstallPlatformio
+  | typeof WS_METHODS.toolchainInstallArduino;
 
 export type EnvironmentStreamRpcTag =
   | EnvironmentSubscriptionRpcTag
```

#### `t3-core/apps/server/src/ws.ts` (+65 / -7)
```diff
--- upstream/apps/server/src/ws.ts
+++ embedino/t3-core/apps/server/src/ws.ts
@@ -71,6 +71,8 @@
   projectThreadDetailSnapshot,
 } from "./orchestration/ActivityPayloadProjection.ts";
 import { normalizeDispatchCommand } from "./orchestration/Normalizer.ts";
+import * as ToolchainService from "./toolchain/ToolchainService.ts";
+import * as DeviceService from "./hardware/DeviceService.ts";
 import * as OrchestrationEngine from "./orchestration/Services/OrchestrationEngine.ts";
 import * as ProjectionSnapshotQuery from "./orchestration/Services/ProjectionSnapshotQuery.ts";
 import {
@@ -1662,10 +1664,22 @@
           observeRpcEffect(WS_METHODS.pullRequestsRunAction, pullRequests.runAction(input), {
             "rpc.aggregate": "pull-requests",
           }),
+        [WS_METHODS.pullRequestsUpdate]: (input) =>
+          observeRpcEffect(WS_METHODS.pullRequestsUpdate, pullRequests.update(input), {
+            "rpc.aggregate": "pull-requests",
+          }),
         [WS_METHODS.pullRequestsComment]: (input) =>
           observeRpcEffect(WS_METHODS.pullRequestsComment, pullRequests.comment(input), {
             "rpc.aggregate": "pull-requests",
           }),
+        [WS_METHODS.pullRequestsUpdateComment]: (input) =>
+          observeRpcEffect(
+            WS_METHODS.pullRequestsUpdateComment,
+            pullRequests.updateComment(input),
+            {
+              "rpc.aggregate": "pull-requests",
+            },
+          ),
         [WS_METHODS.pullRequestsSubmitReview]: (input) =>
           observeRpcEffect(WS_METHODS.pullRequestsSubmitReview, pullRequests.submitReview(input), {
             "rpc.aggregate": "pull-requests",
@@ -1682,6 +1696,10 @@
             pullRequests.setThreadResolution(input),
             { "rpc.aggregate": "pull-requests" },
           ),
+        [WS_METHODS.pullRequestsSetReaction]: (input) =>
+          observeRpcEffect(WS_METHODS.pullRequestsSetReaction, pullRequests.setReaction(input), {
+            "rpc.aggregate": "pull-requests",
+          }),
         [WS_METHODS.pullRequestsInvalidate]: (input) =>
           observeRpcEffect(WS_METHODS.pullRequestsInvalidate, pullRequests.invalidate(input), {
             "rpc.aggregate": "pull-requests",
@@ -2043,6 +2061,38 @@
           observeRpcEffect(WS_METHODS.terminalClose, terminalManager.close(input), {
             "rpc.aggregate": "terminal",
           }),
+        [WS_METHODS.toolchainInstallPlatformio]: (_input) =>
+          observeRpcStream(
+            WS_METHODS.toolchainInstallPlatformio,
+            ToolchainService.installToolchainPlatformio(),
+            { "rpc.aggregate": "toolchain" },
+          ),
+        [WS_METHODS.toolchainInstallArduino]: (_input) =>
+          observeRpcStream(
+            WS_METHODS.toolchainInstallArduino,
+            ToolchainService.installToolchainArduino(),
+            { "rpc.aggregate": "toolchain" },
... [63 more lines]
```

#### `t3-core/apps/server/src/auth/RpcAuthorization.ts` (+9 / -0)
```diff
--- upstream/apps/server/src/auth/RpcAuthorization.ts
+++ embedino/t3-core/apps/server/src/auth/RpcAuthorization.ts
@@ -58,10 +58,13 @@
   [WS_METHODS.pullRequestsActivity]: AuthOrchestrationReadScope,
   [WS_METHODS.pullRequestsDiffFileContents]: AuthOrchestrationReadScope,
   [WS_METHODS.pullRequestsRunAction]: AuthOrchestrationOperateScope,
+  [WS_METHODS.pullRequestsUpdate]: AuthOrchestrationOperateScope,
   [WS_METHODS.pullRequestsComment]: AuthOrchestrationOperateScope,
+  [WS_METHODS.pullRequestsUpdateComment]: AuthOrchestrationOperateScope,
   [WS_METHODS.pullRequestsSubmitReview]: AuthOrchestrationOperateScope,
   [WS_METHODS.pullRequestsReplyToThread]: AuthOrchestrationOperateScope,
   [WS_METHODS.pullRequestsSetThreadResolution]: AuthOrchestrationOperateScope,
+  [WS_METHODS.pullRequestsSetReaction]: AuthOrchestrationOperateScope,
   // Read scope like the reads it un-caches: refreshing is part of reading, and a read-only
   // client pressing refresh must not be told it may not look again.
   [WS_METHODS.pullRequestsInvalidate]: AuthOrchestrationReadScope,
@@ -104,6 +107,9 @@
   [WS_METHODS.terminalClose]: AuthTerminalOperateScope,
   [WS_METHODS.subscribeTerminalEvents]: AuthTerminalOperateScope,
   [WS_METHODS.subscribeTerminalMetadata]: AuthTerminalOperateScope,
+  [WS_METHODS.toolchainInstallPlatformio]: AuthOrchestrationOperateScope,
+  [WS_METHODS.toolchainInstallArduino]: AuthOrchestrationOperateScope,
+  [WS_METHODS.toolchainGetStatus]: AuthOrchestrationReadScope,
   [WS_METHODS.previewOpen]: AuthOrchestrationOperateScope,
   [WS_METHODS.previewNavigate]: AuthOrchestrationOperateScope,
   [WS_METHODS.previewResize]: AuthOrchestrationOperateScope,
@@ -120,6 +126,9 @@
   [WS_METHODS.subscribeServerLifecycle]: AuthOrchestrationReadScope,
   [WS_METHODS.subscribeAuthAccess]: AuthAccessReadScope,
   [WS_METHODS.subscribeBackgroundPolicy]: AuthOrchestrationReadScope,
+  [WS_METHODS.hardwareListDevices]: AuthOrchestrationReadScope,
+  [WS_METHODS.hardwareSubscribeDevices]: AuthOrchestrationReadScope,
+  [WS_METHODS.hardwareSetDeviceAssociation]: AuthOrchestrationOperateScope,
 } as const satisfies Readonly<Record<WsRpcMethod, AuthEnvironmentScope>>;
 
 export function requiredScopeForRpcMethod(method: string): AuthEnvironmentScope {
```

#### `t3-core/apps/web/src/components/sidebar/SidebarChrome.tsx` (+11 / -6)
```diff
--- upstream/apps/web/src/components/sidebar/SidebarChrome.tsx
+++ embedino/t3-core/apps/web/src/components/sidebar/SidebarChrome.tsx
@@ -9,7 +9,7 @@
 
 import { useEnvironmentIdentificationMode } from "../../hooks/useSettings";
 import { cn } from "../../lib/utils";
-import { usePrimaryEnvironment } from "../../state/environments";
+import { useEnvironments } from "../../state/environments";
 import {
   resolveEnvironmentIdentificationPillLabel,
   resolveSidebarStageBackdropVariant,
@@ -30,6 +30,7 @@
 import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
 import { SidebarProviderUpdatePill } from "./SidebarProviderUpdatePill";
 import { SidebarUpdateArchitectureWarning, SidebarUpdatePill } from "./SidebarUpdatePill";
+import { ToolchainSetupPill } from "../wiring/ToolchainSetup";
 
 export const SidebarChromeHeader = memo(function SidebarChromeHeader({
   isElectron,
@@ -91,7 +92,7 @@
       <T3Wordmark />
       <span
         className={cn(
-          "truncate text-sm font-medium tracking-tight",
+          "-translate-y-px truncate text-sm font-medium tracking-tight",
           onBackdrop ? "text-white/70" : "text-muted-foreground",
         )}
       >
@@ -128,9 +129,12 @@
           ? "pull-requests"
           : null,
   });
-  const primaryEnvironment = usePrimaryEnvironment();
-  const pullRequestsSupported =
-    primaryEnvironment?.serverConfig?.environment.capabilities.pullRequests === true;
+  const { environments } = useEnvironments();
+  // The page reads every connected server, so one of them offering pull requests is enough for
+  // the link to lead somewhere.
+  const pullRequestsSupported = environments.some(
+    (environment) => environment.serverConfig?.environment.capabilities.pullRequests === true,
+  );
   const closeMobileSidebar = useCallback(() => {
     if (isMobile) {
       setOpenMobile(false);
@@ -158,9 +162,10 @@
   }, [closeMobileSidebar, navigate]);
 
   return (
-    <SidebarFooter className="p-[var(--sidebar-content-inset)]">
+    <SidebarFooter className="p-[var(--sidebar-content-inset)] gap-2">
       <SidebarProviderUpdatePill />
       <SidebarUpdateArchitectureWarning />
+      <ToolchainSetupPill />
       <SidebarMenu className="flex-row items-center">
         {currentFooterPage ? (
           <SidebarMenuItem className="min-w-0 flex-1">
```

#### `t3-core/apps/web/src/components/BranchToolbar.tsx` (+16 / -14)
```diff
--- upstream/apps/web/src/components/BranchToolbar.tsx
+++ embedino/t3-core/apps/web/src/components/BranchToolbar.tsx
@@ -519,20 +519,22 @@
       )}
 
       {showGitControls ? (
-        <BranchToolbarBranchSelector
-          className="min-w-0 flex-1 justify-end md:ml-auto md:flex-none"
-          environmentId={environmentId}
-          threadId={threadId}
-          {...(draftId ? { draftId } : {})}
-          envLocked={envLocked}
-          {...(effectiveEnvModeOverride ? { effectiveEnvModeOverride } : {})}
-          {...(activeThreadBranchOverride !== undefined ? { activeThreadBranchOverride } : {})}
-          {...(onActiveThreadBranchOverrideChange ? { onActiveThreadBranchOverrideChange } : {})}
-          startFromOrigin={startFromOrigin}
-          onStartFromOriginChange={onStartFromOriginChange}
-          {...(onCheckoutPullRequestRequest ? { onCheckoutPullRequestRequest } : {})}
-          {...(onComposerFocusRequest ? { onComposerFocusRequest } : {})}
-        />
+        <div className="flex items-center gap-2 min-w-0 flex-none ml-auto">
+          <BranchToolbarBranchSelector
+            className="min-w-0 flex-none"
+            environmentId={environmentId}
+            threadId={threadId}
+            {...(draftId ? { draftId } : {})}
+            envLocked={envLocked}
+            {...(effectiveEnvModeOverride ? { effectiveEnvModeOverride } : {})}
+            {...(activeThreadBranchOverride !== undefined ? { activeThreadBranchOverride } : {})}
+            {...(onActiveThreadBranchOverrideChange ? { onActiveThreadBranchOverrideChange } : {})}
+            startFromOrigin={startFromOrigin}
+            onStartFromOriginChange={onStartFromOriginChange}
+            {...(onCheckoutPullRequestRequest ? { onCheckoutPullRequestRequest } : {})}
+            {...(onComposerFocusRequest ? { onComposerFocusRequest } : {})}
+          />
+        </div>
       ) : null}
     </div>
   );
```

#### `t3-core/apps/web/src/components/settings/SettingsPanels.tsx` (+80 / -1)
```diff
--- upstream/apps/web/src/components/settings/SettingsPanels.tsx
+++ embedino/t3-core/apps/web/src/components/settings/SettingsPanels.tsx
@@ -142,6 +142,8 @@
 } from "./settingsLayout";
 import { searchableSetting } from "./settingsSearch";
 import { ProjectFavicon } from "../ProjectFavicon";
+import { useActiveToolchain } from "../../state/toolchain";
+import { ToolchainSetupDialog, useToolchainState } from "../wiring/ToolchainSetup";
 
 const ENVIRONMENT_IDENTIFICATION_LABELS: Record<EnvironmentIdentificationMode, string> = {
   artwork: "Artwork",
@@ -492,6 +494,9 @@
       ...(settings.sidebarAutoSettleAfterDays !==
       DEFAULT_UNIFIED_SETTINGS.sidebarAutoSettleAfterDays
         ? ["Auto-settle inactive threads"]
+        : []),
+      ...(settings.sidebarAutoSettleOnMerge !== DEFAULT_UNIFIED_SETTINGS.sidebarAutoSettleOnMerge
+        ? ["Auto-settle merged threads"]
         : []),
       ...(settings.wordWrap !== DEFAULT_UNIFIED_SETTINGS.wordWrap ? ["Word wrap"] : []),
       ...getChangedTypographySettingLabels(settings),
@@ -547,6 +552,7 @@
       settings.enableLegacyTokenStreaming,
       settings.enableProviderUpdateChecks,
       settings.sidebarAutoSettleAfterDays,
+      settings.sidebarAutoSettleOnMerge,
       settings.sidebarProjectGroupingMode,
       settings.sidebarThreadPreviewCount,
       settings.timestampFormat,
@@ -628,6 +634,7 @@
       sidebarThreadPreviewCount: DEFAULT_UNIFIED_SETTINGS.sidebarThreadPreviewCount,
       sidebarProjectGroupingMode: DEFAULT_UNIFIED_SETTINGS.sidebarProjectGroupingMode,
       sidebarAutoSettleAfterDays: DEFAULT_UNIFIED_SETTINGS.sidebarAutoSettleAfterDays,
+      sidebarAutoSettleOnMerge: DEFAULT_UNIFIED_SETTINGS.sidebarAutoSettleOnMerge,
       enableLegacyTokenStreaming: DEFAULT_UNIFIED_SETTINGS.enableLegacyTokenStreaming,
       enableProviderUpdateChecks: DEFAULT_UNIFIED_SETTINGS.enableProviderUpdateChecks,
       backgroundActivity: DEFAULT_UNIFIED_SETTINGS.backgroundActivity,
@@ -1788,10 +1795,55 @@
     settings.backgroundActivity,
     DEFAULT_UNIFIED_SETTINGS.backgroundActivity,
   );
+  const [activeToolchain, setActiveToolchain] = useActiveToolchain();
+  const snap = useToolchainState();
+  const [manageToolchainOpen, setManageToolchainOpen] = useState(false);
+  const [toolchainSelectKey, setToolchainSelectKey] = useState(0);
 
   return (
     <SettingsPageContainer>
       <SettingsSection title="General">
+        <SettingsRow
+          id="build-toolchain"
+          title="Active Build Toolchain"
+          description="Select the engine used to compile and flash your embedded projects."
+          control={
+            <Select
+              key={toolchainSelectKey}
+              value={activeToolchain ?? "none"}
+              onValueChange={(val) => {
+                if (val === "manage") {
+                  setManageToolchainOpen(true);
... [70 more lines]
```

#### `t3-core/apps/web/src/components/ChatView.tsx` (+198 / -19)
```diff
--- upstream/apps/web/src/components/ChatView.tsx
+++ embedino/t3-core/apps/web/src/components/ChatView.tsx
@@ -27,6 +27,7 @@
   type EnvironmentConnectionPresentation,
 } from "@t3tools/client-runtime/connection";
 import {
+  changeRequestAutoSettles,
   effectiveSettled,
   effectiveSnoozed,
   threadWokeAt,
@@ -123,11 +124,11 @@
 import { useMediaQuery } from "../hooks/useMediaQuery";
 import { RIGHT_PANEL_INLINE_LAYOUT_MEDIA_QUERY } from "../rightPanelLayout";
 import {
-  pullRequestSurfaceId,
   selectActiveRightPanel,
   selectActiveRightPanelSurface,
   selectThreadRightPanelState,
   type RightPanelSurface,
+  updatePullRequestTabStatus,
   useRightPanelStore,
 } from "../rightPanelStore";
 import {
@@ -144,6 +145,7 @@
   selectThreadPreviewMiniPlayer,
   usePreviewMiniPlayerStore,
 } from "../previewMiniPlayerStore";
+import { isThreadOwnPullRequest } from "./pullRequest/pullRequestDetail.logic";
 import { PullRequestDetailPanel } from "./pullRequest/PullRequestDetailPanel";
 import { PullRequestDetailGhost } from "./pullRequest/PullRequestGhosts";
 import { PullRequestsUnavailableState } from "./pullRequest/PullRequestsUnavailableState";
@@ -177,6 +179,7 @@
 } from "~/projectScripts";
 import { newDraftId, newMessageId, newThreadId } from "~/lib/utils";
 import { useBrowserHistoryStore } from "~/browserHistoryStore";
+import { registerFaviconProjectForThread } from "~/browserFaviconStore";
 import { getProviderModelCapabilities, resolveSelectableProvider } from "../providerModels";
 import { NO_PROVIDER_MODEL_SELECTION } from "../providerInstances";
 import {
@@ -216,6 +219,7 @@
 } from "../lib/elementContext";
 import { appendPreviewAnnotationPrompt } from "../lib/previewAnnotation";
 import { appendReviewCommentsToPrompt, type ReviewCommentContext } from "../reviewCommentContext";
+import { useProjectEntriesQuery } from "./files/projectFilesQueryState";
 import { environmentCatalog } from "../connection/catalog";
 import { selectThreadTerminalUiState, useTerminalUiStateStore } from "../terminalUiStateStore";
 import { useKnownTerminalSessions, useThreadRunningTerminalIds } from "../state/terminalSessions";
@@ -244,6 +248,8 @@
 } from "../state/entities";
 import { environmentShell } from "../state/shell";
 import { ChatComposer, type ChatComposerHandle } from "./chat/ChatComposer";
+import { useActiveToolchain, toolchainStateAtom } from "../state/toolchain";
+import { hardwareStateAtom } from "../state/hardware";
 import { DraftHeroHeadline } from "./chat/DraftHeroHeadline";
 import { ExpandedImageDialog } from "./chat/ExpandedImageDialog";
 import { PullRequestThreadDialog } from "./PullRequestThreadDialog";
@@ -480,6 +486,14 @@
   if (eventPathContainsSelector(event, TYPE_TO_FOCUS_INTERACTIVE_SELECTOR)) return false;
   if (document.querySelector(TYPE_TO_FOCUS_FLOATING_LAYER_SELECTOR)) return false;
 
... [348 more lines]
```

#### `t3-core/apps/web/src/components/chat/ChatHeader.tsx` (+14 / -0)
```diff
--- upstream/apps/web/src/components/chat/ChatHeader.tsx
+++ embedino/t3-core/apps/web/src/components/chat/ChatHeader.tsx
@@ -4,7 +4,10 @@
   type ProjectScript,
   type ResolvedKeybindingsConfig,
   type ThreadId,
+  type HardwareDevice,
 } from "@t3tools/contracts";
+import { BoardSelectorPill, type HardwareAction } from "../hardware/BoardSelectorPill";
+import type { ActiveToolchain } from "../../state/toolchain";
 import { scopeThreadRef } from "@t3tools/client-runtime/environment";
 import {
   isAtomCommandInterrupted,
@@ -58,6 +61,11 @@
   openInCwd: string | null;
   activeProjectScripts: ReadonlyArray<ProjectScript> | undefined;
   preferredScriptId: string | null;
+  onRunHardwareAction: (
+    action: HardwareAction,
+    device: HardwareDevice,
+    toolchain: NonNullable<ActiveToolchain>,
+  ) => void;
   keybindings: ResolvedKeybindingsConfig;
   availableEditors: ReadonlyArray<EditorId>;
   rightPanelOpen: boolean;
@@ -112,6 +120,7 @@
   openInCwd,
   activeProjectScripts,
   preferredScriptId,
+  onRunHardwareAction,
   keybindings,
   availableEditors,
   rightPanelOpen,
@@ -203,6 +212,7 @@
   );
   const handleRenameKeyDown = useCallback(
     (event: ReactKeyboardEvent<HTMLInputElement>) => {
+      if (event.nativeEvent.isComposing || event.keyCode === 229) return;
       if (event.key === "Enter") {
         renameCommittedRef.current = true;
         commitRename(event.currentTarget.value);
@@ -319,6 +329,10 @@
             onDeleteScript={onDeleteProjectScript}
           />
         )}
+        <BoardSelectorPill
+          environmentId={activeThreadEnvironmentId}
+          onRunHardwareAction={onRunHardwareAction}
+        />
         {showOpenInPicker && (
           <OpenInPicker
             environmentId={activeThreadEnvironmentId}
```
