// What is publishing, what is held back, and why.
import { ALL } from './audit.mjs';
import { blockingIssues } from '../src/lib/publishGate.js';

const held = [], live = [];
for (const { post } of ALL) (post.draft ? held : live).push(post);

console.log(`PUBLISHING: ${live.length} of ${ALL.length} posts\n`);
if (held.length) {
  console.log(`HELD BACK: ${held.length}`);
  for (const p of held) {
    const why = p.heldBack || blockingIssues(p);
    console.log(`  ${p.id}\n      ${why.join('; ') || 'marked draft by hand'}`);
  }
}
