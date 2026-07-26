// Rewrap over-long comment lines in every shipped lab.
//
// Only whole-line comments are touched, and only their line breaks: no word
// is added, removed or reordered, and no line of code is altered. That keeps
// this safe to run mechanically, unlike editing code, which has broken a
// lesson twice in this series while leaving the code perfectly valid.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { ALL } from './audit.mjs';

const MAX = 60;
const SERIES = 'src/data/seriesPosts.js';
const ai = (id) => `content/ai-series/${id}.js`;

function rewrap(code) {
  const out = [];
  let i = 0;
  const lines = code.split('\n');

  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^(\s*)#\s?(.*)$/);
    if (!m || line.length <= MAX) { out.push(line); i++; continue; }

    // Gather the contiguous comment block at this indent so a long line can
    // flow into its neighbours rather than being chopped in isolation.
    const indent = m[1];
    const prefix = `${indent}# `;
    const words = [];
    let j = i;
    while (j < lines.length) {
      const mm = lines[j].match(/^(\s*)#\s?(.*)$/);
      if (!mm || mm[1] !== indent) break;
      if (mm[2].trim() === '') break;           // blank comment ends the block
      words.push(...mm[2].trim().split(/\s+/));
      j++;
    }

    let cur = prefix;
    for (const w of words) {
      if (cur.length > prefix.length && (cur + ' ' + w).length > MAX) {
        out.push(cur);
        cur = prefix + w;
      } else {
        cur = cur.length > prefix.length ? `${cur} ${w}` : prefix + w;
      }
    }
    if (cur.trim() !== '#') out.push(cur);
    i = j;
  }
  return out.join('\n');
}

const byFile = new Map();
for (const { post } of ALL) {
  post.body.forEach((b) => {
    if (b.type !== 'lab') return;
    const before = String(b.code);
    const after = rewrap(before);
    if (after === before) return;
    const f = ai(post.id);
    const file = existsSync(f) ? f : SERIES;
    if (!byFile.has(file)) byFile.set(file, []);
    byFile.get(file).push({ id: post.id, before, after });
  });
}

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
let changed = 0;
for (const [file, jobs] of byFile) {
  let src = readFileSync(file, 'utf8');
  for (const job of jobs) {
    const needle = esc(job.before);
    if (!src.includes(needle)) { console.log(`  skip ${job.id}: code not found verbatim`); continue; }
    src = src.replace(needle, esc(job.after));
    changed++;
  }
  writeFileSync(file, src);
}
console.log(`rewrapped comments in ${changed} lab(s)`);
