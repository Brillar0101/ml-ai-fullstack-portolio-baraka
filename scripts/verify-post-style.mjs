// Style and citation checks for posts rewritten against research papers
// (any post whose sources block is `numbered`). Older posts are skipped until
// they are rewritten. Fails the run on anything a reader would notice: dashes
// the style bans, a superscript that points past the end of the source list,
// a figure without alt text, or runnable labs in a reading-only post.
import { AI_SERIES_POSTS } from '../src/data/aiSeriesPosts.js';
import { SERIES_POSTS } from '../src/data/seriesPosts.js';
import { EMBEDDED_POSTS } from '../src/data/embeddedPosts.js';

const BANNED_WORDS = /\b(delve|tapestry|testament|pivotal|underscores?|showcas(e|es|ing)|vibrant|seamless(ly)?|additionally|crucial|landscape)\b/gi;
const CITE = /\[\^(\d+(?:,\s*\d+)*)\]/g;

function textOf(block) {
  return [block.text, block.caption, block.title, ...(block.items || []).map((i) => (typeof i === 'string' ? i : `${i.term || ''} ${i.def || ''}`))]
    .filter((t) => typeof t === 'string')
    .join(' ');
}

let failures = 0;
let checked = 0;
for (const post of [...AI_SERIES_POSTS, ...SERIES_POSTS, ...EMBEDDED_POSTS]) {
  const sources = post.body?.find((b) => b.type === 'sources');
  if (!sources?.numbered) continue;
  checked++;
  const problems = [];
  const all = post.body.map(textOf).join('\n') + `\n${post.title}\n${post.excerpt}`;

  if (/[—–]/.test(all)) problems.push('contains an em or en dash');
  const banned = [...new Set((all.match(BANNED_WORDS) || []).map((w) => w.toLowerCase()))];
  if (banned.length) problems.push(`AI-vocabulary words: ${banned.join(', ')}`);
  for (const m of all.matchAll(CITE)) {
    m[1].split(',').map(Number).forEach((n) => {
      if (n < 1 || n > sources.items.length) problems.push(`citation [^${n}] but only ${sources.items.length} sources`);
    });
  }
  if (!/\[\^\d/.test(all)) problems.push('numbered sources but no [^n] citations');
  post.body.filter((b) => b.type === 'image' && !b.alt).forEach((b) => problems.push(`image without alt: ${b.src}`));
  if (post.body.some((b) => b.type === 'lab')) problems.push('has a runnable lab block');
  if (post.body.some((b) => b.type === 'terms' && b.optional !== false)) problems.push('terms block hidden in essay format (set optional: false)');

  if (problems.length) {
    failures++;
    console.log(`FAIL  ${post.id}\n      ${[...new Set(problems)].join('\n      ')}`);
  } else {
    console.log(`ok    ${post.id}`);
  }
}
console.log(`\n${checked} rewritten post(s) checked, ${failures} with problems`);
process.exitCode = failures ? 1 : 0;
