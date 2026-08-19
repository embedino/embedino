import os
import sys
import json
from pathlib import Path

LOCAL_DIR = Path(r"c:\Users\rapid\Desktop\embedino workspace")
MANIFEST_PATH = LOCAL_DIR / ".agents" / "worker_diff_1" / "diff_manifest.json"
SUMMARY_PATH = LOCAL_DIR / ".agents" / "worker_diff_1" / "diff_summary.md"

with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

meta = manifest['metadata']
pinned = meta['pinned_base_commit']
head = meta['latest_upstream_head']
modified = manifest['modified_files']
added = manifest['added_files']
pruned_cats = manifest['pruned_files_by_category']
pruned_files = manifest['pruned_files']

# Filter out tsbuildinfo from added if needed or tag them
for a in added:
    if a['path'].endswith('.tsbuildinfo'):
        a['category'] = 'Build Artifact (TS Build Info)'
        a['description'] = 'TypeScript incremental build cache info'
    elif 'pullRequest' in a['path'] or 'PullRequest' in a['path']:
        a['category'] = 'Upstream Sync Feature (Pull Requests)'
        a['description'] = 'Pull request management component synced from upstream T3 Code'
    elif 'favicon' in a['path'].lower() or 'Favicon' in a['path']:
        a['category'] = 'Upstream Sync Feature (Favicon System)'
        a['description'] = 'Favicon discovery and caching system synced from upstream T3 Code'
    elif 'clerk' in a['path']:
        a['category'] = 'Upstream Sync Feature (Clerk User Profile)'
        a['description'] = 'Clerk user profile and appearance handling'
    elif a['path'].startswith('.github/'):
        a['category'] = 'CI / CD Workflows'
        a['description'] = 'GitHub Actions CI/CD workflows and automated checks'

# Group modified files by category
mod_by_cat = {}
for m in modified:
    cat = m['category']
    mod_by_cat.setdefault(cat, []).append(m)

# Group added files by category
added_by_cat = {}
for a in added:
    cat = a['category']
    added_by_cat.setdefault(cat, []).append(a)

# Generate Markdown Summary
md = []
md.append("# Programmatic Differential Mapping Report: Embedino vs. Upstream T3 Code")
md.append("")
md.append(f"**Generated:** {meta['timestamp']}  ")
md.append(f"**Base Upstream Graft SHA:** `{pinned['sha']}` ({pinned['subject']})  ")
md.append(f"**Latest Upstream HEAD SHA:** `{head['sha']}` ({head['subject']})  ")
md.append(f"**Upstream Repository:** `{meta['upstream_repository']}`  ")
md.append(f"**Local Workspace Root:** `{meta['workspace_layout']['embedino_root']}`  ")
md.append(f"**Upstream Container Directory:** `{meta['workspace_layout']['upstream_graft_container']}`  ")
md.append("")
md.append("---")
md.append("")
md.append("## Executive Differential Metrics")
md.append("")
md.append("| Metric | Count | Description |")
md.append("| :--- | :---: | :--- |")
md.append(f"| **Identical Files** | **{meta['counts']['identical_files_count']:,}** | Files in `t3-core` byte-for-byte identical to upstream base SHA |")
md.append(f"| **Modified Files** | **{len(modified):,}** | Files in `t3-core` with modifications (docking ports, integrations, syncs) |")
md.append(f"| **Added Files (Total)** | **{len(added):,}** | Files added in Embedino (Hardware modules, atoms, root configs, synced features) |")
md.append(f"| ↳ *Added in Workspace Root* | *{meta['counts']['added_root_files_count']}* | `AGENTS.md`, `PATCH.md`, `regraft.json`, `usb_devices.json`, etc. |")
md.append(f"| ↳ *Added in `t3-core/`* | *{meta['counts']['added_t3core_files_count']}* | Dedicated hardware/toolchain code and synced components |")
md.append(f"| **Pruned / Deleted Files** | **{len(pruned_files):,}** | Upstream files excluded or removed (`apps/mobile/**`, `docs/`, `infra/`, `.repos/`) |")
md.append("")
md.append("---")
md.append("")
md.append("## 1. Categorized Breakdown of Modified Files")
md.append("")
md.append("Following Embedino's **95/5 Modular Isolation Principle** (`AGENTS.md`), upstream modifications are strictly constrained to minimal 'thin docking ports' and necessary context pipelines.")
md.append("")

# Detail each category of modified files
for cat, files in sorted(mod_by_cat.items()):
    total_added = sum(f['lines_added'] for f in files)
    total_deleted = sum(f['lines_deleted'] for f in files)
    md.append(f"### {cat} ({len(files)} files, +{total_added} / -{total_deleted} lines)")
    md.append("")
    md.append("| File Path | Local Lines | Upstream Lines | Diff (+/-) | Role & Architectural Purpose |")
    md.append("| :--- | :---: | :---: | :---: | :--- |")
    for f in sorted(files, key=lambda x: x['path']):
        md.append(f"| `{f['path']}` | {f['local_lines']} | {f['upstream_lines']} | +{f['lines_added']} / -{f['lines_deleted']} | {f['role']} |")
    md.append("")

md.append("---")
md.append("")
md.append("## 2. Categorized Breakdown of Added Files")
md.append("")
md.append("These files represent dedicated Embedino functionality (the 95% of custom code) that lives in isolated directories to prevent merge conflicts during upstream pulls.")
md.append("")

for cat, files in sorted(added_by_cat.items()):
    total_lines = sum(f['lines'] for f in files)
    md.append(f"### {cat} ({len(files)} files, {total_lines:,} total lines)")
    md.append("")
    md.append("| File Path | Line Count | Description |")
    md.append("| :--- | :---: | :--- |")
    for f in sorted(files, key=lambda x: x['path']):
        md.append(f"| `{f['path']}` | {f['lines']} | {f['description']} |")
    md.append("")

md.append("---")
md.append("")
md.append("## 3. Pruned and Excluded Upstream Folders")
md.append("")
md.append("Embedino uses `regraft.json` to prune unused upstream components (e.g. mobile applications, marketing, cloud infra) to focus strictly on desktop & embedded workflows.")
md.append("")
md.append("| Upstream Directory / Scope | File Count | Pruning Rationale |")
md.append("| :--- | :---: | :--- |")
for cat, count in sorted(pruned_cats.items(), key=lambda x: -x[1]):
    rationale = "Excluded to maintain lightweight embedded desktop focus"
    if cat == "apps":
        rationale = "Pruned `apps/mobile` (React Native / iOS / Android app) as Embedino targets desktop/web embedded IDE"
    elif cat == ".repos":
        rationale = "Upstream repo cache and submodules excluded from graft tracking"
    elif cat in [".claude", ".codex", ".cursor", ".devcontainer", ".macroscope", ".plans", ".vscode"]:
        rationale = "Upstream internal IDE configs and draft plans excluded from Embedino"
    elif cat == "infra":
        rationale = "Upstream cloud infrastructure and deployment scripts excluded"
    elif cat == "docs":
        rationale = "Upstream website and docs pruned"
    elif cat == "root_files":
        rationale = "Upstream repository root files replaced by Embedino workspace root files"
    md.append(f"| `{cat}/` | {count:,} | {rationale} |")
md.append("")

md.append("---")
md.append("")
md.append("## 4. Deep-Dive: Thin Docking Ports Verification against `AGENTS.md`")
md.append("")
md.append("Section 4 of `AGENTS.md` defines the approved thin docking ports for Embedino:")
md.append("")
md.append("1. **`packages/contracts/src/index.ts`** — Re-exports `toolchain.ts` and `hardware/devices.ts`.")
md.append("2. **`packages/contracts/src/rpc.ts`** — Defines RPC schemas (`ToolchainInstall*`, `Hardware*`).")
md.append("3. **`packages/client-runtime/src/rpc/client.ts`** — Registers `EnvironmentStreamCommandRpcTag` / hardware subscription tag.")
md.append("4. **`apps/server/src/ws.ts`** — Registers toolchain and hardware WebSocket RPC handlers.")
md.append("5. **`apps/server/src/auth/RpcAuthorization.ts`** — Maps authorization for hardware and toolchain RPC endpoints.")
md.append("6. **`apps/web/src/components/sidebar/SidebarChrome.tsx`** — Renders `<ToolchainSetupPill />`.")
md.append("7. **`apps/web/src/components/BranchToolbar.tsx`** — Renders `<BoardSelectorPill />`.")
md.append("8. **`apps/web/src/components/settings/SettingsPanels.tsx`** — Renders Active Build Toolchain settings row.")
md.append("")
md.append("### Docking Port Diff Details")
md.append("")

docking_files = [
    "packages/contracts/src/index.ts",
    "packages/contracts/src/rpc.ts",
    "packages/client-runtime/src/rpc/client.ts",
    "apps/server/src/ws.ts",
    "apps/server/src/auth/RpcAuthorization.ts",
    "apps/web/src/components/sidebar/SidebarChrome.tsx",
    "apps/web/src/components/BranchToolbar.tsx",
    "apps/web/src/components/settings/SettingsPanels.tsx",
    "apps/web/src/components/ChatView.tsx",
    "apps/web/src/components/chat/ChatHeader.tsx"
]

for df_path in docking_files:
    matching = [m for m in modified if m['relative_to_t3core'] == df_path]
    if matching:
        m = matching[0]
        md.append(f"#### `{m['path']}` (+{m['lines_added']} / -{m['lines_deleted']})")
        md.append("```diff")
        # include full diff or snippet
        diff_lines = m['full_diff'].splitlines()
        if len(diff_lines) > 60:
            md.append("\n".join(diff_lines[:60]))
            md.append(f"... [{len(diff_lines)-60} more lines]")
        else:
            md.append(m['full_diff'])
        md.append("```")
        md.append("")

with open(SUMMARY_PATH, 'w', encoding='utf-8') as f:
    f.write("\n".join(md))

# Also rewrite updated manifest with updated categories
with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2)

print(f"Generated {SUMMARY_PATH}")
