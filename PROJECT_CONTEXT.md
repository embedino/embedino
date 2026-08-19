# Embedino Workspace: Master Context & Architecture

## 1. What is Embedino?
**Embedino** is a local-first, AI-powered workspace built specifically for embedded systems and hardware engineers. It is built on top of the open-source T3 Code editor.
Embedino is NOT just another generic AI chatbot. It is the operating system for embedded engineers. Users bring their own AI providers (OpenAI, Claude, Ollama, etc.), and Embedino provides the hardware-specific engineering workflows.

## 2. V1 MVP: The 5 "Killer Features"
The initial release strips away unnecessary bloat and focuses entirely on the daily tasks of a hardware engineer:

- **[COMPLETED] AI with Bring Your Own Provider (BYOP)**: Context-aware chat for explaining errors, generating drivers, reading datasheets, and intelligent hardware-aware generation. The agent automatically detects the selected toolchain (Arduino CLI vs PlatformIO) and active board in the UI, correctly scaffolding `.ino` or `platformio.ini` boilerplates without hallucinating pins.
- **[COMPLETED] Automatic Board & Device Detection**: A dedicated hardware panel that polls USB devices, COM ports, and identifies chips instantly. Uses OS-level scanning (`powershell` / `system_profiler` / `/sys/class/tty`) and persistent storage (`~/.embedino/device-associations.json`) mapped dynamically via Effect reactive atoms into a T3 UI component.
- **[COMPLETED] One-Click Flash & Build (with Smart Onboarding)**: Embedino provides a choice of build systems (PlatformIO, Arduino CLI, or native SDKs) during the initial onboarding. It handles the heavy downloading and installation upfront, ensuring the workspace remains lightweight while guaranteeing a flawless, one-click runtime experience.
- **Interactive Wiring Viewer (Code-First with Isolated Tab Preview)**: A right-panel UI triggered by a "Preview Wiring" button on configuration files. Instead of a cluttered full-board map, it provides isolated component tabs (e.g., [MPU6050], [SD Card]) showing only the specific wiring for the selected component to reduce visual noise. It features beautiful vector canvas views and raw data tables (with "Copy as Markdown" for easy documentation).
- **AI-Powered Datasheet Explorer (pdf.js integration)**: A side-by-side layout (Chat in center, PDF on right). Uses pdf.js to render a selectable HTML text layer over PDFs. Selecting text in the PDF triggers a pop-up action menu (e.g., "✨ Ask AI") that injects the selected context directly into the AI chat panel.

## 3. Codebase Foundation (T3 Code)
Embedino is built on top of **[pingdotgg/t3code](https://github.com/pingdotgg/t3code)**.
- T3 Code provides the cross-platform harness (Desktop, Web, Mobile) and the foundational text editor / AI plumbing.
- Embedino's hardware features will primarily target the **Desktop App**, as hardware interactions (USB/Serial) require deep OS-level access.
- **Current Upstream Sync**: Synced to commit `038560e` (all upstream PRs through August 14, 2026, pulled and verified).

## 4. The Sync Strategy: Regraft (CRITICAL CONTEXT)
To maintain Embedino on top of T3 Code without being broken by their upstream updates, we use **[Regraft](https://github.com/treadiehq/regraft)** instead of a traditional Git Fork or Git Subtree.

**Why Regraft?**
- It allows us to selectively copy specific folders (like the desktop app or specific UI components) from T3 Code into the Embedino repository.
- It keeps our Git history 100% clean and isolated from T3 Code's history.
- It provides a `regraft note` feature. When we modify T3 Code files to inject Embedino hardware features, we leave notes explaining why we changed them.
- When T3 Code releases a new version, we run `regraft pull`. It intelligently merges their new features with our custom hardware modifications, allowing us to maintain complete control.

## 5. The 3 Golden Rules for Scaling to 100+ Features
To guarantee that adding 100+ features never causes merge conflicts or breaks upstream synchronization:

- **Rule 1: The 95/5 Modular Isolation Principle (Dedicated Directories)**
  95% of all feature logic lives in dedicated Embedino directories (e.g., `packages/contracts/src/hardware/`, `apps/server/src/hardware/`, `apps/web/src/components/wiring/`, `apps/web/src/components/datasheet/`). Because upstream T3 Code never touches these files, they have zero chance of merge conflicts.
- **Rule 2: Thin "Docking Ports" (Minimal Upstream Touches)**
  Touch upstream files ONLY at defined docking points (e.g. 1-line re-export in `index.ts`, 1-line RPC registration in `rpc.ts` and `ws.ts`, 1-line `<ToolchainSetupPill />` in `SidebarChrome.tsx`). This allows Regraft's 3-way merge to effortlessly weave upstream UI updates around our single-line hooks.
- **Rule 3: Explicit Regraft Exclusions**
  `regraft.json` explicitly excludes unneeded folders (`mobile/**`, `marketing/**`) so deleted upstream code never stalls automated pulls.

> **Note for AI Agents**: Refer to `AGENTS.md` at workspace root for full engineering standards and verification commands.
