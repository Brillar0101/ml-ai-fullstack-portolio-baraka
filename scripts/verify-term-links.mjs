// Confirm every defined-term link points at something that exists.
import { TERM_LINKS } from '../src/data/termLinks.js';

const urls = [...new Set(Object.values(TERM_LINKS))];
let bad = 0;
await Promise.all(urls.map(async (url) => {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (link-check)' } });
    if (!res.ok) { console.log(`HTTP ${res.status}  ${url}`); bad++; }
  } catch (e) { console.log(`ERROR  ${url}  ${e.message}`); bad++; }
}));
console.log(`\n${Object.keys(TERM_LINKS).length} terms -> ${urls.length} distinct URLs, ${bad} broken`);
process.exit(bad ? 1 : 0);
