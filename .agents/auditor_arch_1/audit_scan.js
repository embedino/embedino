const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

const identicalUpstream = [];
const modifiedUpstream = [];
const dedicatedEmbedino = [];
const rootConfigFiles = [];

for (const f of allGitFiles) {
  if (f.startsWith('.agents/')) continue;
  if (!f.startsWith('t3-core/')) {
    rootConfigFiles.push(f);
    continue;
  }
  if (regraftTracked.has(f)) {
    const info = regraftTracked.get(f);
    if (info.upstreamHash === info.localHash) {
      identicalUpstream.push(f);
    } else {
      modifiedUpstream.push({ file: f, ...info });
    }
  } else {
    dedicatedEmbedino.push(f);
  }
}

console.log('=== FILE DISTRIBUTION SUMMARY ===');
console.log('Total git-tracked files in repo:', allGitFiles.length);
console.log('Root workspace files:', rootConfigFiles.length);
console.log('Identical Upstream files in t3-core:', identicalUpstream.length);
console.log('Modified Upstream files in t3-core:', modifiedUpstream.length);
console.log('Dedicated Embedino files in t3-core:', dedicatedEmbedino.length);

console.log('\n=== DEDICATED EMBEDINO FILES ===');
let dedicatedTotalLines = 0;
const dedicatedList = [];
for (const f of dedicatedEmbedino) {
  let lines = 0;
  if (fs.existsSync(f)) {
    const content = fs.readFileSync(f, 'utf8');
    lines = content.split(/\r?\n/).length;
    dedicatedTotalLines += lines;
  }
  dedicatedList.push({ file: f, lines });
}
dedicatedList.sort((a, b) => b.lines - a.lines);
dedicatedList.forEach(d => console.log(`  ${d.file}: ${d.lines} lines`));
console.log(`Total Dedicated Lines: ${dedicatedTotalLines}`);

console.log('\n=== MODIFIED UPSTREAM FILES BY EMBEDINO FEATURE INTENTS ===');
const embedinoCustomIntents = new Set(['226c33dc', '1702dc62', '86385d25', 'c6ac8d02', '61cf438d', '1321fb50', '218ccffe', 'd492efad']);

const embedinoTouchedUpstream = [];
const syncOnlyUpstream = [];

for (const m of modifiedUpstream) {
  const hasEmbedinoIntent = m.intentIds.some(id => embedinoCustomIntents.has(id));
  if (hasEmbedinoIntent) {
    embedinoTouchedUpstream.push(m);
  } else {
    syncOnlyUpstream.push(m);
  }
}

console.log(`\nFiles touched by Embedino feature customizations: ${embedinoTouchedUpstream.length}`);
embedinoTouchedUpstream.forEach(m => {
  console.log(`  ${m.file} (intents: ${m.intentIds.join(',')})`);
});

console.log(`\nFiles with sync-only diffs (b848f9e5): ${syncOnlyUpstream.length}`);
