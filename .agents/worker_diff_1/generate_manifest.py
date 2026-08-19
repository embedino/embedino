import os
import sys
import json
import subprocess
import difflib
from pathlib import Path

UPSTREAM_DIR = Path(r"c:\Users\rapid\Desktop\t3code-official")
LOCAL_DIR = Path(r"c:\Users\rapid\Desktop\embedino workspace")
PINNED_SHA = "5a84614809b6e853b872f9e57ff4b97e9df5df02"

IGNORE_DIR_NAMES = {
    'node_modules', '.git', '.agents', '.regraft', 'caches', 'userdata', 
    'worktrees', 'dist', 'build', '.turbo', '.next', '.vite', 'dist-electron',
    '.vite-hooks'
}

IGNORE_FILE_PATTERNS = {
    '.DS_Store', 'Thumbs.db', '*.log', '*.tsbuildinfo'
}

def is_ignored(path: Path):
    parts = path.parts
    for ignored in IGNORE_DIR_NAMES:
        if ignored in parts:
            return True
    return False

def get_git_files(repo_path, commit):
    cmd = ["git", "ls-tree", "-r", "--name-only", commit]
    res = subprocess.run(cmd, cwd=repo_path, capture_output=True, text=True, check=True)
    return set(res.stdout.strip().splitlines())

def get_git_content(repo_path, commit, rel_path):
    cmd = ["git", "show", f"{commit}:{rel_path}"]
    res = subprocess.run(cmd, cwd=repo_path, capture_output=True)
    if res.returncode != 0:
        return None
    return res.stdout.decode('utf-8', errors='replace')

def get_git_commit_info(repo_path, commit):
    cmd = ["git", "show", "-s", "--format=%H|%an|%ae|%ad|%s", commit]
    res = subprocess.run(cmd, cwd=repo_path, capture_output=True, text=True, check=True)
    parts = res.stdout.strip().split('|')
    return {
        "sha": parts[0],
        "author_name": parts[1],
        "author_email": parts[2],
        "date": parts[3],
        "subject": parts[4]
    }

def categorize_modified_file(rel_path: str, diff_text: str):
    if "apps/server/src/ws.ts" in rel_path:
        return {
            "category": "Thin Docking Port (Server RPC Registration)",
            "role": "Server WebSocket entrypoint registering hardware and toolchain RPC routes (95/5 rule)"
        }
    if "packages/contracts/src/rpc.ts" in rel_path:
        return {
            "category": "Thin Docking Port (Contract RPC Endpoints)",
            "role": "Effect RPC endpoint contracts defining toolchain and hardware operations"
        }
    if "packages/contracts/src/index.ts" in rel_path:
        return {
            "category": "Thin Docking Port (Contracts Re-export)",
            "role": "Re-export of hardware and toolchain contract modules"
        }
    if "packages/client-runtime/src/rpc/client.ts" in rel_path:
        return {
            "category": "Thin Docking Port (Client Runtime Tagging)",
            "role": "Registers hardware stream / environment tags in client RPC"
        }
    if "apps/server/src/auth/RpcAuthorization.ts" in rel_path:
        return {
            "category": "Thin Docking Port (Server RPC Auth Mapping)",
            "role": "Hardware and toolchain RPC authorization handler mapping"
        }
    if "apps/web/src/components/sidebar/SidebarChrome.tsx" in rel_path:
        return {
            "category": "Thin Docking Port (UI Navigation)",
            "role": "Mounting ToolchainSetupPill into sidebar navigation"
        }
    if "apps/web/src/components/BranchToolbar.tsx" in rel_path:
        return {
            "category": "Thin Docking Port (UI Toolbar)",
            "role": "Mounting BoardSelectorPill into top branch toolbar"
        }
    if "apps/web/src/components/settings/SettingsPanels.tsx" in rel_path:
        return {
            "category": "Thin Docking Port (UI Settings)",
            "role": "Mounting Active Build Toolchain settings row in Settings panels"
        }
    if "apps/web/src/components/ChatView.tsx" in rel_path or "apps/web/src/components/chat/ChatHeader.tsx" in rel_path:
        return {
            "category": "Docking Port / UI Enhancement (Chat View & Header)",
            "role": "Chat header board selector integration and active hardware/toolchain context injection"
        }
    if "apps/server/src/orchestration/" in rel_path or "apps/server/src/provider/" in rel_path:
        return {
            "category": "Backend Integration (Orchestration & Provider Layers)",
            "role": "Hardware context propagation (activeToolchain, activeDeviceId) to AI providers and decider"
        }
    if "packages/contracts/src/orchestration.ts" in rel_path or "packages/contracts/src/provider.ts" in rel_path:
        return {
            "category": "Contracts Enhancement (Orchestration & Provider Schemas)",
            "role": "Adding activeToolchain and activeDeviceId to turn start request and provider payloads"
        }
    if "pullRequest" in rel_path or "pull-requests" in rel_path or "PullRequest" in rel_path:
        return {
            "category": "Upstream Divergence / PR Feature Sync",
            "role": "Pull Request feature updates synced from upstream T3 Code"
        }
    if "scripts/build-desktop-artifact" in rel_path or "scripts/release-smoke" in rel_path or "package.json" in rel_path or "pnpm-workspace.yaml" in rel_path:
        return {
            "category": "Build & Workspace Configuration",
            "role": "Desktop build packaging, smoke test, and monorepo workspace dependencies"
        }
    if "index.css" in rel_path:
        return {
            "category": "UI Styling",
            "role": "Embedino custom styling and toolchain/hardware dialog styles"
        }
    return {
        "category": "Other Modified Upstream File",
        "role": "Upstream component update / sync"
    }

def categorize_added_file(rel_path: str):
    if "packages/contracts/src/hardware" in rel_path or "packages/contracts/src/toolchain" in rel_path:
        return {
            "category": "Contracts & Schemas (Hardware & Toolchain)",
            "description": "Dedicated Effect TS schemas for hardware devices, toolchain status, install progress events"
        }
    if "apps/server/src/hardware" in rel_path:
        return {
            "category": "Backend Hardware Engine (Server)",
            "description": "Cross-platform USB/Serial scanning (DeviceService), VID/PID database (BoardDatabase), device association store"
        }
    if "apps/server/src/toolchain" in rel_path:
        return {
            "category": "Backend Toolchain Engine (Server)",
            "description": "Toolchain detection (PlatformIO, Arduino CLI, native toolchains) via binary & filesystem checks"
        }
    if "apps/web/src/state/hardware" in rel_path or "apps/web/src/state/toolchain" in rel_path:
        return {
            "category": "Frontend Reactive State (Web)",
            "description": "Reactive Effect atoms and store for connected hardware devices and toolchain status"
        }
    if "apps/web/src/components/hardware" in rel_path:
        return {
            "category": "Frontend UI Components (Hardware)",
            "description": "BoardSelectorPill, BoardSelectorPopover, BoardNamingDialog, DeviceDetails components"
        }
    if "apps/web/src/components/wiring" in rel_path:
        return {
            "category": "Frontend UI Components (Wiring & Toolchain)",
            "description": "ToolchainSetup dialog, interactive wiring canvas and component visualizers"
        }
    if "apps/web/src/components/datasheet" in rel_path:
        return {
            "category": "Frontend UI Components (Datasheet Explorer)",
            "description": "PDF datasheet viewer with selectable text layer and Ask AI integration"
        }
    if rel_path in ["AGENTS.md", "PATCH.md", "regraft.json", "usb_devices.json", "logo.svg", "CHANGELOG.md", "README.md", "LICENSE"]:
        return {
            "category": "Embedino Workspace Root Configuration",
            "description": "Embedino architecture documentation, Regraft configuration, USB vendor/product ID database, and branding"
        }
    return {
        "category": "Other Dedicated Embedino Module",
        "description": "Custom extension module for Embedino"
    }

def main():
    print("Executing full differential analysis...")
    pinned_info = get_git_commit_info(UPSTREAM_DIR, PINNED_SHA)
    head_info = get_git_commit_info(UPSTREAM_DIR, "HEAD")
    
    upstream_pinned_files = get_git_files(UPSTREAM_DIR, PINNED_SHA)
    upstream_head_files = get_git_files(UPSTREAM_DIR, "HEAD")
    
    # Collect all local files in t3-core and root
    t3_core = LOCAL_DIR / "t3-core"
    local_t3_core_files = {}
    for root, dirs, files in os.walk(t3_core):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIR_NAMES]
        for f in files:
            p = Path(root) / f
            if is_ignored(p):
                continue
            rel = p.relative_to(t3_core).as_posix()
            local_t3_core_files[rel] = p
            
    local_root_files = {}
    for f in LOCAL_DIR.iterdir():
        if f.is_file():
            if f.name not in ['.DS_Store', 'Thumbs.db']:
                local_root_files[f.name] = f
        elif f.is_dir() and f.name not in IGNORE_DIR_NAMES and f.name != 't3-core':
            for root, dirs, subfiles in os.walk(f):
                dirs[:] = [d for d in dirs if d not in IGNORE_DIR_NAMES]
                for sf in subfiles:
                    p = Path(root) / sf
                    if not is_ignored(p):
                        rel = p.relative_to(LOCAL_DIR).as_posix()
                        local_root_files[rel] = p

    # Compare local t3-core files against upstream pinned SHA
    identical_files = []
    modified_files = []
    added_t3_core_files = []
    
    for rel_path, abs_path in sorted(local_t3_core_files.items()):
        if rel_path in upstream_pinned_files:
            up_text = get_git_content(UPSTREAM_DIR, PINNED_SHA, rel_path)
            with open(abs_path, 'r', encoding='utf-8', errors='replace') as lf:
                loc_text = lf.read()
                
            # Normalize newlines
            up_lines = up_text.splitlines()
            loc_lines = loc_text.splitlines()
            
            if up_lines == loc_lines:
                identical_files.append(rel_path)
            else:
                # Compute unified diff
                diff = list(difflib.unified_diff(
                    up_lines, loc_lines,
                    fromfile=f"upstream/{rel_path}",
                    tofile=f"embedino/t3-core/{rel_path}",
                    lineterm=""
                ))
                additions = sum(1 for line in diff if line.startswith('+') and not line.startswith('+++'))
                deletions = sum(1 for line in diff if line.startswith('-') and not line.startswith('---'))
                
                cat_info = categorize_modified_file(rel_path, "\n".join(diff))
                
                modified_files.append({
                    "path": f"t3-core/{rel_path}",
                    "relative_to_t3core": rel_path,
                    "upstream_lines": len(up_lines),
                    "local_lines": len(loc_lines),
                    "lines_added": additions,
                    "lines_deleted": deletions,
                    "net_change": len(loc_lines) - len(up_lines),
                    "category": cat_info["category"],
                    "role": cat_info["role"],
                    "diff_snippet": "\n".join(diff[:50]) + ("\n... [diff truncated]" if len(diff) > 50 else ""),
                    "full_diff": "\n".join(diff)
                })
        else:
            # Added file in t3-core
            with open(abs_path, 'r', encoding='utf-8', errors='replace') as lf:
                loc_lines = lf.read().splitlines()
            cat_info = categorize_added_file(rel_path)
            added_t3_core_files.append({
                "path": f"t3-core/{rel_path}",
                "relative_to_t3core": rel_path,
                "lines": len(loc_lines),
                "category": cat_info["category"],
                "description": cat_info["description"]
            })
            
    # Added root files
    added_root_files = []
    for rel_path, abs_path in sorted(local_root_files.items()):
        with open(abs_path, 'r', encoding='utf-8', errors='replace') as lf:
            loc_lines = lf.read().splitlines()
        cat_info = categorize_added_file(rel_path)
        added_root_files.append({
            "path": rel_path,
            "lines": len(loc_lines),
            "category": cat_info["category"],
            "description": cat_info["description"]
        })
        
    all_added_files = added_root_files + added_t3_core_files
    
    # Deleted / Pruned upstream files
    deleted_upstream_files = sorted(list(upstream_pinned_files - set(local_t3_core_files.keys())))
    pruned_by_category = {}
    for df in deleted_upstream_files:
        top_dir = df.split('/')[0] if '/' in df else 'root_files'
        pruned_by_category.setdefault(top_dir, []).append(df)
        
    print(f"Summary metrics:")
    print(f"  Identical files: {len(identical_files)}")
    print(f"  Modified files: {len(modified_files)}")
    print(f"  Added files (Total): {len(all_added_files)} (Root: {len(added_root_files)}, t3-core: {len(added_t3_core_files)})")
    print(f"  Pruned / Deleted upstream files: {len(deleted_upstream_files)}")
    
    # Prepare diff_manifest.json
    manifest = {
        "metadata": {
            "timestamp": "2026-08-19T14:30:00Z",
            "upstream_repository": "https://github.com/pingdotgg/t3code.git",
            "pinned_base_commit": pinned_info,
            "latest_upstream_head": head_info,
            "workspace_layout": {
                "embedino_root": str(LOCAL_DIR),
                "upstream_graft_container": "t3-core/",
                "upstream_clone_path": str(UPSTREAM_DIR)
            },
            "counts": {
                "identical_files_count": len(identical_files),
                "modified_files_count": len(modified_files),
                "added_files_count": len(all_added_files),
                "added_root_files_count": len(added_root_files),
                "added_t3core_files_count": len(added_t3_core_files),
                "pruned_upstream_files_count": len(deleted_upstream_files)
            }
        },
        "modified_files": modified_files,
        "added_files": all_added_files,
        "pruned_files_by_category": {k: len(v) for k, v in pruned_by_category.items()},
        "pruned_files": deleted_upstream_files
    }
    
    out_manifest = LOCAL_DIR / ".agents" / "worker_diff_1" / "diff_manifest.json"
    with open(out_manifest, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)
    print(f"Wrote manifest to {out_manifest}")
    
    return manifest

if __name__ == "__main__":
    main()
