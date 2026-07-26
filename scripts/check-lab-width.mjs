// Fail if a lab has a line that will wrap on a phone.
//
// Scoped by default to the posts named as arguments, because the backlog of
// not-yet-upgraded labs would otherwise block every commit and the check would
// get disabled within the hour. Pass no arguments to audit everything.
import { ALL } from './audit.mjs';

const MAX = 60;
const only = process.argv.slice(2);
let bad = 0;
let checked = 0;

for (const { post } of ALL) {
  if (only.length && !only.includes(post.id)) continue;
  post.body.filter((b) => b.type === 'lab').forEach((b) => {
    checked++;
    const over = String(b.code).split('\n')
      .map((l, n) => [n + 1, l])
      .filter(([, l]) => l.length > MAX);
    if (!over.length) return;
    bad += over.length;
    console.log(`${post.id}: ${over.length} line(s) over ${MAX}`);
    over.slice(0, 3).forEach(([n, l]) => console.log(`   ${n}: ${l.length}  ${l.trim().slice(0, 44)}`));
  });
}

const scope = only.length ? only.join(', ') : `all ${checked} labs`;
console.log(bad ? `\n${bad} line(s) will wrap (${scope})` : `\nwithin ${MAX} columns: ${scope}`);
process.exitCode = bad ? 1 : 0;
