// Replace one post's lab code with the file of the same name in scripts/labs/.
// Matches by post id so it cannot patch the wrong block.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const id = process.argv[2];
const SERIES = 'src/data/seriesPosts.js';
const AI = `content/ai-series/${id}.js`;
const file = existsSync(AI) ? AI : SERIES;
const py = readFileSync(`scripts/labs/${id}.py`, 'utf8').replace(/\s+$/, '\n');

let src = readFileSync(file, 'utf8');
const from = file === SERIES ? src.indexOf(`id: '${id}'`) : 0;
if (from === -1) throw new Error(`${id}: post not found`);
const labAt = src.indexOf("{ type: 'lab'", from);
if (labAt === -1) throw new Error(`${id}: no lab block`);
const tick = src.indexOf('`', labAt);
let j = tick + 1;
while (j < src.length) { if (src[j] === '\\') { j += 2; continue; } if (src[j] === '`') break; j++; }
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
writeFileSync(file, src.slice(0, tick + 1) + esc(py) + src.slice(j));
console.log(`patched ${id} (${file})`);
