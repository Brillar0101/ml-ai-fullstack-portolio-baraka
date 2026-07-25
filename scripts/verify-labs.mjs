// Execute every lab exactly as it ships.
//
// The code is pulled out of the published post data, not out of the staging
// directory, so this proves that what a reader clicks Run on actually runs.
// A lab that throws, or that prints nothing, is a broken promise.
//
// Labs declare their dependencies the same way Pyodide loads them, via the
// block's `packages` field. This script builds a throwaway virtualenv with the
// union of those packages so the check is self-contained.
//
// Run: npm run verify:labs
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ALL } from './audit.mjs';

const work = join(tmpdir(), 'lab-verify');
const venv = join(work, 'venv');
const venvPy = join(venv, 'bin', 'python');
mkdirSync(work, { recursive: true });

// Collect every lab and every package any of them needs.
const labs = [];
const packages = new Set();
for (const { post } of ALL) {
  post.body.forEach((block, i) => {
    if (block.type !== 'lab') return;
    labs.push({ name: `${post.id}-${i}`, code: block.code, packages: block.packages || [] });
    (block.packages || []).forEach((p) => packages.add(p));
  });
}

// Build the interpreter once, then reuse it across runs.
let PY = process.env.LAB_PYTHON || 'python3';
if (packages.size) {
  if (!existsSync(venvPy)) {
    console.log(`building a virtualenv for: ${[...packages].join(', ')}`);
    execFileSync(PY, ['-m', 'venv', venv], { stdio: 'inherit' });
    execFileSync(venvPy, ['-m', 'pip', 'install', '-q', ...packages], { stdio: 'inherit' });
  }
  PY = venvPy;
}

let ok = 0;
const failures = [];
for (const lab of labs) {
  const file = join(work, `${lab.name}.py`);
  writeFileSync(file, lab.code);
  try {
    const out = execFileSync(PY, [file], { encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'] });
    if (!out.trim()) {
      failures.push({ name: lab.name, why: 'ran but printed nothing' });
      continue;
    }
    ok++;
  } catch (err) {
    const msg = (err.stderr || err.message || '').toString().trim().split('\n').slice(-3).join(' | ');
    failures.push({ name: lab.name, why: msg.slice(0, 180) });
  }
}

for (const f of failures) console.log(`FAIL  ${f.name}\n      ${f.why}`);
console.log(`\n${ok} labs ran and produced output, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
