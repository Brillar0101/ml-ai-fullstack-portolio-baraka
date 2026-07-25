// Split paragraphs that run past five sentences.
//
// A reader covers about 28% of the words on a page (NN/g eyetracking), and
// long blocks get skipped whole rather than read slowly. This inserts a
// paragraph break at the sentence boundary nearest the middle, preferring a
// boundary where the next sentence opens with a discourse marker so the break
// lands where the argument already turns.
//
// It changes ZERO words. Only paragraph boundaries move, so every verified
// claim in the post stays byte-identical.
import { readFileSync, writeFileSync } from 'node:fs';

const MAX_SENTENCES = 5;
// Openers that signal a genuine turn in the argument, so a break reads natural.
const PIVOTS = /^(But|So|Then|Now|That|This|The|Once|Notice|And|Yet|Worse|Here|Either|Both|Nothing|None|Every|A |An |In |For |If |When |What |Why |Treat|Reach|Pick|Start|Spend)/;

// Split into sentences without breaking on decimals, abbreviations, or the
// numbered items that appear in this prose ("GPT-4.", "e.g.").
function sentences(text) {
  const parts = [];
  let buf = '';
  for (let i = 0; i < text.length; i++) {
    buf += text[i];
    if (!/[.!?]/.test(text[i])) continue;
    if (/\d$/.test(buf.slice(0, -1)) && /^\d/.test(text[i + 1] || '')) continue; // 3.5
    const next = text[i + 1];
    const after = text[i + 2];
    if (next === ' ' && after && after === after.toUpperCase() && /[A-Z"'(]/.test(after)) {
      parts.push(buf.trim());
      buf = '';
      i++;
    } else if (next === undefined) {
      parts.push(buf.trim());
      buf = '';
    }
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts;
}

function bestBreak(sents) {
  const mid = Math.floor(sents.length / 2);
  // Search outward from the middle for a sentence that opens with a pivot.
  for (let d = 0; d < sents.length; d++) {
    for (const i of [mid - d, mid + d]) {
      if (i > 1 && i < sents.length - 1 && PIVOTS.test(sents[i])) return i;
    }
  }
  return mid;
}

// Rewrite one `text: '...'` literal into two paragraph blocks.
function splitText(raw) {
  const sents = sentences(raw);
  if (sents.length <= MAX_SENTENCES) return null;
  const at = bestBreak(sents);
  if (at < 2 || at > sents.length - 2) return null;
  return [sents.slice(0, at).join(' '), sents.slice(at).join(' ')];
}

const files = process.argv.slice(2);
let split = 0;

for (const file of files) {
  let src = readFileSync(file, 'utf8');
  let out = '';
  let cursor = 0;
  // Match a paragraph block and capture its single-quoted text literal.
  const re = /\{\s*type:\s*'p',\s*text:\s*'((?:[^'\\]|\\.)*)'\s*\}/g;
  let m;
  while ((m = re.exec(src))) {
    const literal = m[1];
    // Work on the unescaped text so sentence detection is accurate.
    const plain = literal.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    const parts = splitText(plain);
    if (!parts) continue;
    const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const indent = ' '.repeat(6);
    const replacement = `{ type: 'p', text: '${esc(parts[0])}' },\n${indent}{ type: 'p', text: '${esc(parts[1])}' }`;
    out += src.slice(cursor, m.index) + replacement;
    cursor = m.index + m[0].length;
    split++;
  }
  out += src.slice(cursor);
  if (split) writeFileSync(file, out);
}
console.log(`${split} paragraphs split`);
