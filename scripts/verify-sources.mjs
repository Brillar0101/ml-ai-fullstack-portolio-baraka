// Re-verify every source in the library against the live web.
//
// arXiv entries are checked through the arXiv API and the returned title is
// compared against the title we cite, so a transposed digit that happens to
// point at a real but unrelated paper gets caught. Everything else is fetched
// and checked for a 200.
//
// Two things this deliberately gets right:
//
//   1. "I could not reach the API" is reported separately from "this citation
//      is wrong". A flaky network must never look like a broken source, or the
//      check stops meaning anything and people start ignoring it.
//   2. It sets process.exitCode instead of calling process.exit(), because
//      process.exit() truncates buffered stdout and silently swallows most of
//      the report when output is piped to a file.
//
// Run: npm run verify:sources
import { S } from '../src/data/sources-library.js';

const BATCH = 20;
const RETRIES = 3;

const arxiv = [];
const web = [];
for (const [key, src] of Object.entries(S)) {
  const m = src.url.match(/arxiv\.org\/abs\/([\d.]+)/);
  if (m) arxiv.push({ key, id: m[1], src });
  else web.push({ key, src });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchTitles(ids) {
  const url = `http://export.arxiv.org/api/query?id_list=${ids.join(',')}&max_results=${ids.length}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`arXiv API returned ${res.status}`);
  const xml = await res.text();
  const out = {};
  for (const entry of xml.split('<entry>').slice(1)) {
    const id = (entry.match(/<id>.*?abs\/([\d.]+)/) || [])[1];
    const title = (entry.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
    if (id && title) out[id] = title.replace(/\s+/g, ' ').trim();
  }
  if (!Object.keys(out).length) throw new Error('arXiv API returned no parseable entries');
  return out;
}

const titles = {};
const unreachable = [];

for (let i = 0; i < arxiv.length; i += BATCH) {
  const chunk = arxiv.slice(i, i + BATCH);
  const ids = chunk.map((c) => c.id);
  let got = null;
  for (let attempt = 1; attempt <= RETRIES && !got; attempt++) {
    try {
      got = await fetchTitles(ids);
    } catch (err) {
      if (attempt === RETRIES) {
        console.log(`  (arXiv API unreachable for ${ids.length} ids: ${err.message})`);
      } else {
        await sleep(2000 * attempt);
      }
    }
  }
  if (got) Object.assign(titles, got);
  else unreachable.push(...ids);
  if (i + BATCH < arxiv.length) await sleep(3000);
}

// Any id the API answered for but did not return is worth a single retry on its
// own, since a batch can silently drop one entry.
for (const { id } of arxiv) {
  if (titles[id] || unreachable.includes(id)) continue;
  try {
    Object.assign(titles, await fetchTitles([id]));
  } catch {
    unreachable.push(id);
  }
  await sleep(1000);
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
let broken = 0;
let skipped = 0;

for (const { key, id, src } of arxiv) {
  if (unreachable.includes(id)) { skipped++; continue; }
  const real = titles[id];
  if (!real) {
    console.log(`MISSING   ${key.padEnd(16)} arXiv:${id} does not resolve`);
    broken++;
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
    broken++;
  }
}

await Promise.all(web.map(async ({ key, src }) => {
  try {
    const res = await fetch(src.url, { headers: { 'User-Agent': 'Mozilla/5.0 (link-check)' } });
    if (!res.ok) {
      console.log(`HTTP ${res.status}  ${key.padEnd(16)} ${src.url}`);
      broken++;
    }
  } catch (err) {
    console.log(`UNREACHABLE  ${key.padEnd(16)} ${src.url} (${err.message})`);
    skipped++;
  }
}));

console.log(`\nchecked ${arxiv.length} arXiv + ${web.length} web sources`);
console.log(`  broken:      ${broken}`);
console.log(`  unverified:  ${skipped}${skipped ? ' (could not reach the source, not a citation error)' : ''}`);

// Only a genuinely broken citation fails the run. An unreachable network does
// not, or the check becomes noise people learn to ignore.
process.exitCode = broken ? 1 : 0;
