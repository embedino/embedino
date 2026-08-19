const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const gitDir = '.regraft/cache/https-github.com-pingdotgg-t3code.git-3dfa76ef0a';
const upstreamSha = '5a84614809b6e853b872f9e57ff4b97e9df5df02';
const regraft = JSON.parse(fs.readFileSync('regraft.json', 'utf8'));

// Build lookup of tracked files in regraft
const regraftTracked = new Map();
for (const graft of regraft.grafts) {
  const graftDest = graft.dest;
  for (const [relPath, info] of Object.entries(graft.files || {})) {
    const fullPath = (graftDest.endsWith('.json') || graftDest.endsWith('.yaml'))
      ? graftDest
      : path.posix.join(graftDest, relPath);
    regraftTracked.set(fullPath, { graftName: graft.name, graftDest, relPath, ...info });
  }
}

const gitFilesRaw = execSync('git ls-files', { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
const allGitFiles = gitFilesRaw.trim().split(/\r?\n/).map(p => p.trim().replace(/\\/g, '/')).filter(Boolean);

// Filter out .agents, caches, dist, etc.
const sourceExts = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.yaml', '.yml']);

const dedicatedSourceFiles = [];
for (const f of allGitFiles) {
  if (f.includes('/.agents/') || f.startsWith('.agents/') || f.includes('/dist') || f.includes('/caches/')) continue;
  if (!f.startsWith('t3-core/')) continue;
  if (!regraftTracked.has(f)) {
    const ext = path.extname(f);
    if (sourceExts.has(ext)) {
      dedicatedSourceFiles.push(f);
    }
  }
}

console.log('=== DEDICATED EMBEDINO SOURCE FILES (' + dedicatedSourceFiles.length + ') ===');
let dedicatedLOC = 0;
const dedicatedByCategory = {
  'Contracts & Schemas': [],
  'Backend Services': [],
  'Web State & Atoms': [],
  'Web Components': [],
  'Other / Config': []
};

for (const f of dedicatedSourceFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split(/\r?\n/).length;
  dedicatedLOC += lines;
  
  if (f.includes('packages/contracts/src/hardware') || f.includes('packages/contracts/src/toolchain.ts')) {
    dedicatedByCategory['Contracts & Schemas'].push({ f, lines });
  } else if (f.includes('apps/server/src/hardware') || f.includes('apps/server/src/toolchain')) {
    dedicatedByCategory['Backend Services'].push({ f, lines });
  } else if (f.includes('apps/web/src/state/hardware') || f.includes('apps/web/src/state/toolchain')) {
    dedicatedByCategory['Web State & Atoms'].push({ f, lines });
  } else if (f.includes('apps/web/src/components/hardware') || f.includes('apps/web/src/components/wiring')) {
    dedicatedByCategory['Web Components'].push({ f, lines });
  } else {
    dedicatedByCategory['Other / Config'].push({ f, lines });
  }
}

for (const [cat, files] of Object.entries(dedicatedByCategory)) {
  const totalCatLines = files.reduce((s, x) => s + x.lines, 0);
  console.log(`\nCategory [${cat}] - ${files.length} files, ${totalCatLines} lines:`);
  files.forEach(x => console.log(`  - ${x.f}: ${x.lines} lines`));
}

console.log(`\nTotal Dedicated Source Code Lines: ${dedicatedLOC}`);

// Now analyze the 31 modified upstream files with Embedino customizations
const embedinoCustomIntents = new Set(['226c33dc', '1702dc62', '86385d25', 'c6ac8d02', '61cf438d', '1321fb50', '218ccffe', 'd492efad']);

const modifiedFilesAnalysis = [];

for (const [fullPath, info] of regraftTracked.entries()) {
  if (info.upstreamHash !== info.localHash) {
    const hasEmbedinoIntent = info.intentIds.some(id => embedinoCustomIntents.has(id));
    if (hasEmbedinoIntent) {
      // Get upstream relative path
      let upstreamRel = fullPath.replace(/^t3-core\//, '');
      if (upstreamRel.startsWith('.github')) upstreamRel = upstreamRel; // keep
      
      let upstreamContent = '';
      try {
        upstreamContent = execSync(`git --git-dir=\"${gitDir}\" show ${upstreamSha}:\"${upstreamRel}\"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      } catch (e) {
        upstreamContent = '';
      }
      
      let localContent = '';
      if (fs.existsSync(fullPath)) {
        localContent = fs.readFileSync(fullPath, 'utf8');
      }
      
      const upstreamLines = upstreamContent ? upstreamContent.split(/\r?\n/).length : 0;
      const localLines = localContent ? localContent.split(/\r?\n/).length : 0;
      
      // Calculate diff using git diff
      let diffOutput = '';
      try {
        // Write upstream content to temp file and diff
        const tmpUp = path.join('.agents/auditor_arch_1', 'tmp_upstream');
        fs.writeFileSync(tmpUp, upstreamContent);
        diffOutput = execSync(`git diff --no-index --stat \"${tmpUp}\" \"${fullPath}\"`, { encoding: 'utf8' }).trim();
        fs.unlinkSync(tmpUp);
      } catch (e) {
        if (e.stdout) diffOutput = e.stdout.toString().trim();
      }
      
      modifiedFilesAnalysis.push({
        file: fullPath,
        intents: info.intentIds,
        upstreamLines,
        localLines,
        diffStat: diffOutput
      });
    }
  }
}

console.log('\n=== MODIFIED UPSTREAM FILES DIFF SUMMARY (' + modifiedFilesAnalysis.length + ' files) ===');
for (const item of modifiedFilesAnalysis) {
  console.log(`\nFile: ${item.file}`);
  console.log(`  Intents: ${item.intents.join(', ')}`);
  console.log(`  Upstream lines: ${item.upstreamLines} -> Local lines: ${item.localLines} (net change: ${item.localLines - item.upstreamLines})`);
  console.log(`  Diff: ${item.diffStat}`);
}
