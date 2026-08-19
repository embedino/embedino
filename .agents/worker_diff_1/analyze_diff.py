import os
import sys
import json
import subprocess
import hashlib
from pathlib import Path

UPSTREAM_DIR = Path(r"c:\Users\rapid\Desktop\t3code-official")
LOCAL_DIR = Path(r"c:\Users\rapid\Desktop\embedino workspace")
PINNED_SHA = "5a84614809b6e853b872f9e57ff4b97e9df5df02"

IGNORE_DIRS = {
    'node_modules', '.git', '.agents', '.regraft', 'caches', 'userdata', 
    'worktrees', 'dist', 'build', '.turbo', '.next', '.vite'
}

def get_git_files_at_commit(repo_path, commit):
    cmd = ["git", "ls-tree", "-r", "--name-only", commit]
    res = subprocess.run(cmd, cwd=repo_path, capture_output=True, text=True, check=True)
    return set(res.stdout.strip().splitlines())

def get_git_file_content(repo_path, commit, rel_path):
    cmd = ["git", "show", f"{commit}:{rel_path}"]
    res = subprocess.run(cmd, cwd=repo_path, capture_output=True)
    if res.returncode != 0:
        return None
    return res.stdout

def normalize_crlf(data: bytes) -> bytes:
    return data.replace(b"\r\n", b"\n")

def hash_bytes(data: bytes) -> str:
    return hashlib.sha256(normalize_crlf(data)).hexdigest()

def scan_local_files():
    local_files = {} # rel_path (relative to t3-core or workspace root) -> abs_path
    
    # scan t3-core
    t3_core = LOCAL_DIR / "t3-core"
    for root, dirs, files in os.walk(t3_core):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            abs_p = Path(root) / f
            rel_p = abs_p.relative_to(t3_core).as_posix()
            local_files[("t3-core", rel_p)] = abs_p
            
    # scan root workspace files
    for f in LOCAL_DIR.iterdir():
        if f.is_file():
            local_files[("root", f.name)] = f
        elif f.is_dir() and f.name not in IGNORE_DIRS and f.name != "t3-core":
            for root, dirs, subfiles in os.walk(f):
                dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
                for sf in subfiles:
                    abs_p = Path(root) / sf
                    rel_p = abs_p.relative_to(LOCAL_DIR).as_posix()
                    local_files[("root", rel_p)] = abs_p
                    
    return local_files

def main():
    upstream_pinned_files = get_git_files_at_commit(UPSTREAM_DIR, PINNED_SHA)
    upstream_head_files = get_git_files_at_commit(UPSTREAM_DIR, "HEAD")
    local_files = scan_local_files()
    
    print(f"Upstream files at pinned SHA ({PINNED_SHA[:8]}): {len(upstream_pinned_files)}")
    print(f"Upstream files at HEAD: {len(upstream_head_files)}")
    print(f"Local files scanned: {len(local_files)}")
    
    # Let's see how t3-core files compare to upstream pinned files
    t3_core_files = {k[1]: v for k, v in local_files.items() if k[0] == "t3-core"}
    root_files = {k[1]: v for k, v in local_files.items() if k[0] == "root"}
    
    print(f"Local t3-core files: {len(t3_core_files)}")
    print(f"Local root files: {len(root_files)}")
    
    # Check matching, modified, added, deleted
    modified_in_t3core = []
    identical_in_t3core = []
    added_in_t3core = []
    
    for rel_p, abs_p in sorted(t3_core_files.items()):
        if rel_p in upstream_pinned_files:
            up_content = get_git_file_content(UPSTREAM_DIR, PINNED_SHA, rel_p)
            with open(abs_p, "rb") as lf:
                loc_content = lf.read()
            up_hash = hash_bytes(up_content)
            loc_hash = hash_bytes(loc_content)
            if up_hash == loc_hash:
                identical_in_t3core.append(rel_p)
            else:
                modified_in_t3core.append((rel_p, len(loc_content.splitlines()), len(up_content.splitlines())))
        else:
            added_in_t3core.append(rel_p)
            
    deleted_upstream = sorted(list(upstream_pinned_files - set(t3_core_files.keys())))
    
    print(f"Identical files in t3-core: {len(identical_in_t3core)}")
    print(f"Modified files in t3-core: {len(modified_in_t3core)}")
    print(f"Added files in t3-core: {len(added_in_t3core)}")
    print(f"Deleted / Pruned upstream files: {len(deleted_upstream)}")
    
    print("\n--- Modified files in t3-core ---")
    for mf, loc_lines, up_lines in modified_in_t3core:
        print(f"  {mf} (Local: {loc_lines} lines, Upstream: {up_lines} lines)")
        
    print("\n--- Sample Added files in t3-core ---")
    for af in added_in_t3core[:20]:
        print(f"  {af}")
    if len(added_in_t3core) > 20:
        print(f"  ... and {len(added_in_t3core) - 20} more")

if __name__ == "__main__":
    main()
