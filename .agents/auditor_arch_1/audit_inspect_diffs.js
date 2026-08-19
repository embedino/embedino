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

const embedinoCustomIntents = new Set(['226c33dc', '1702dc62', '86385d25', 'c6ac8d02', '61cf438d', '1321fb50', '218ccffe', 'd492efad']);

const filesToInspect = [];
for (const [fullPath, info] of regraftTracked.entries()) {
  if (info.upstreamHash !== info.localHash) {
    if (info.intentIds.some(id => embedinoCustomIntents.has(id))) {
      filesToInspect.push({ fullPath, info });
    }
  }
}

console.log(`Total files touched by Embedino feature customizations: ${filesToInspect.length}`);

const report = [];

for (const { fullPath, info } of filesToInspect) {
  let upstreamRel = fullPath.replace(/^t3-core\//, '');
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

  const tmpUp = path.join('.agents/auditor_arch_1', 'tmp_up.txt');
  const tmpLoc = path.join('.agents/auditor_arch_1', 'tmp_loc.txt');
  fs.writeFileSync(tmpUp, upstreamContent);
  fs.writeFileSync(tmpLoc, localContent);

  let diff = '';
  try {
    diff = execSync(`git diff -U1 --no-index \"${tmpUp}\" \"${tmpLoc}\"`, { encoding: 'utf8' });
  } catch (e) {
    if (e.stdout) diff = e.stdout.toString();
  }
  fs.unlinkSync(tmpUp);
  fs.unlinkSync(tmpLoc);

  // Count added/removed lines
  const diffLines = diff.split(/\r?\n/);
  let added = 0;
  let removed = 0;
  for (const line of diffLines) {
    if (line.startsWith('+') && !line.startsWith('+++')) added++;
    if (line.startsWith('-') && !line.startsWith('---')) removed++;
  }

  report.push({
    file: fullPath,
    intents: info.intentIds,
    added,
    removed,
    diff: diffLines.slice(0, 40).join('\n') // first 40 lines of diff
  });
}

report.sort((a, b) => (b.added + b.removed) - (a.added + a.removed));

for (const r of report) {
  console.log(`\n=======================================================`);
  console.log(`FILE: ${r.file}`);
  console.log(`INTENTS: ${r.intents.join(', ')}`);
  console.log(`DIFF STAT: +${r.added} / -${r.removed} lines`);
  console.log(`DIFF PREVIEW:`);
  console.log(r.diff);
}
