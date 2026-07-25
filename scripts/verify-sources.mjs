// Re-verify every source in the library against the live web.
//
// arXiv entries are checked through the arXiv API and the returned title is
// compared against the title we cite, so a transposed digit that happens to
// point at a real but unrelated paper gets caught. Everything else is fetched
// and checked for a 200.
//
// Run: node scripts/verify-sources.mjs
import { S } from '../src/data/sources-library.js';

const entries = Object.entries(S);
const arxiv = [];
const web = [];
for (const [key, src] of entries) {
  const m = src.url.match(/arxiv\.org\/abs\/([\d.]+)/);
  if (m) arxiv.push({ key, id: m[1], src });
  else web.push({ key, src });
}

// ---- arXiv: confirm the ID exists and the title matches what we cite -------
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const titles = {};
for (let i = 0; i < arxiv.length; i += 25) {
  const chunk = arxiv.slice(i, i + 25);
  const url = `http://export.arxiv.org/api/query?id_list=${chunk.map((c) => c.id).join(',')}&max_results=${chunk.length}`;
  const xml = await (await fetch(url)).text();
  for (const entry of xml.split('<entry>').slice(1)) {
    const id = (entry.match(/<id>.*?abs\/([\d.]+)/) || [])[1];
    const title = (entry.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
    if (id && title) titles[id] = title.replace(/\s+/g, ' ').trim();
  }
  if (i + 25 < arxiv.length) await new Promise((r) => setTimeout(r, 3000));
}

let failures = 0;
for (const { key, id, src } of arxiv) {
  const real = titles[id];
  if (!real) {
    console.log(`MISSING   ${key.padEnd(16)} arXiv:${id} did not resolve`);
    failures++;
    continue;
  }
  // The cited title carries an author prefix, so check that the real title's
  // distinctive words survive into what we wrote.
  const realWords = norm(real).split(' ').filter((w) => w.length > 4);
  const cited = norm(src.title);
  const overlap = realWords.filter((w) => cited.includes(w)).length / Math.max(realWords.length, 1);
  if (overlap < 0.5) {
    console.log(`MISMATCH  ${key.padEnd(16)} arXiv:${id}`);
    console.log(`          cited: ${src.title}`);
    console.log(`          real:  ${real}`);
    failures++;
  }
}

// ---- Everything else: confirm it loads ------------------------------------
await Promise.all(web.map(async ({ key, src }) => {
  try {
    const res = await fetch(src.url, { headers: { 'User-Agent': 'Mozilla/5.0 (link-check)' } });
    if (!res.ok) {
      console.log(`HTTP ${res.status}  ${key.padEnd(16)} ${src.url}`);
      failures++;
    }
  } catch (err) {
    console.log(`ERROR     ${key.padEnd(16)} ${src.url} (${err.message})`);
    failures++;
  }
}));

console.log(`\nchecked ${arxiv.length} arXiv + ${web.length} web sources, ${failures} problem(s)`);
process.exit(failures ? 1 : 0);
