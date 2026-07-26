// Fail if any shipped lab has a line that will wrap on a phone.
// Added because I twice committed violations after reading the count and
// deciding it was fine. A check you can overrule by squinting is not a check.
import { ALL } from './audit.mjs';

const MAX = 60;
let bad = 0;
for (const { post } of ALL) {
  post.body.filter((b) => b.type === 'lab').forEach((b) => {
    const over = String(b.code).split('\n')
      .map((l, n) => [n + 1, l])
      .filter(([, l]) => l.length > MAX);
    if (over.length) {
      bad += over.length;
      console.log(`${post.id}: ${over.length} line(s) over ${MAX}`);
      over.slice(0, 3).forEach(([n, l]) => console.log(`   ${n}: ${l.length}  ${l.trim().slice(0, 46)}`));
    }
  });
}
console.log(bad ? `\n${bad} line(s) will wrap on a phone` : `\nall lab lines within ${MAX} columns`);
process.exitCode = bad ? 1 : 0;
