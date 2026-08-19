# Project: Embedino vs Upstream t3code Diff, Rationale & Architecture/Quality Audit

## Architecture & Scope
Comprehensive comparison of the Embedino repository against the upstream `pingdotgg/t3code` repository.
Evaluates:
1. Exact file-by-file diffs (added, modified, deleted).
2. Deep-dive rationale behind every architectural modification, feature addition, and customization for embedded systems IDE workflows.
3. Strict verification of AGENTS.md guidelines:
   - 95/5 Modular Isolation Principle
   - Thin Docking Ports validation
   - Regraft exclusions and sync safety
   - Security, code quality, potential bugs, performance regressions
4. Critical AI Chat Investigation: Root cause and fix for hardware Embedino agent leaking full system prompt & hardware context into user chat.
5. Production of a single comprehensive, definitive Markdown audit report.
6. Independent Judge review and signoff.

## Feature Inventory & Analysis Areas
| # | Area / Feature | Description | Milestone |
|---|----------------|-------------|-----------|
| 1 | Upstream Setup & Differential Mapping | Clone `pingdotgg/t3code` into `c:\Users\rapid\Desktop\t3code-official`, map added/modified/deleted files across monorepo | M1 |
| 2 | Hardware Detection & Device Subsystem Rationale | Deep-dive rationale for USB/COM device scanning, board database, device association store | M2 |
| 3 | Toolchain & Flash Engine Rationale | Deep-dive rationale for Arduino CLI / PlatformIO / toolchain detection and install streams | M2 |
| 4 | UI & State Docking Ports Rationale | Deep-dive rationale for BoardSelectorPill, ToolchainSetup, BranchToolbar, SettingsPanels, Effect atoms | M2 |
| 5 | Monorepo / Desktop / Pruned Folders Rationale | Deep-dive rationale for mobile pruning, electron packaging, contracts packaging | M2 |
| 6 | 95/5 Modular Isolation & Docking Port Audit | Check all modified files against AGENTS.md rule 1, 2, and 3; flag any violations | M3 |
| 7 | Code Quality, Bug & Reliability Audit | Static & logic analysis of device polling, effect schemas, error handling, edge cases | M3 |
| 8 | Security & Performance Audit | Audit RPC authorization, process execution safety, memory leaks, unconstrained polling | M3 |
| 9 | Chat Prompt & Hardware Context Leakage Audit | Deep-dive root-cause analysis and exact fix for system prompt leakage in user chat vs upstream | M3 |
| 10| Comprehensive Unified Report Generation | Assemble full audit report with all evidence, tables, diffs, rationales, and verdicts | M4 |
| 11| Independent Judge Review & Validation | Review report against AGENTS.md criteria, verify non-superficial coverage, final signoff | M5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Setup & Workspace Diff Mapping | Clone upstream repo, run programmatic diffs, generate structured inventory | none | IN_PROGRESS |
| M2 | Deep-Dive Rationale Analysis | Exhaustive rationale analysis across all subsystems | M1 | IN_PROGRESS |
| M3 | Architecture, Quality, Security & Prompt Leakage Audit | In-depth audit of isolation compliance, bugs, security, performance, prompt leak | M1 | IN_PROGRESS |
| M4 | Comprehensive Markdown Report Assembly | Write definitive single Markdown report | M2, M3 | PLANNED |
| M5 | Independent Judge Review & Signoff | Independent review against AGENTS.md, score, signoff | M4 | PLANNED |
