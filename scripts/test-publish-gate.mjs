// Prove the gate actually rejects, rather than passing everything by accident.
import { blockingIssues, meetsBar, gate } from '../src/lib/publishGate.js';

const good = { id: 'g', body: [
  { type: 'p', text: 'word '.repeat(950) },
  { type: 'sources', items: Array.from({length:5},(_,i)=>({title:'t'+i,url:'https://x/'+i})) },
]};
const thin = { id: 't', body: [
  { type: 'p', text: 'word '.repeat(950) },
  { type: 'sources', items: Array.from({length:3},(_,i)=>({title:'t'+i,url:'https://x/'+i})) },
]};
const short = { id: 's', body: [
  { type: 'p', text: 'word '.repeat(100) },
  { type: 'sources', items: Array.from({length:5},(_,i)=>({title:'t'+i,url:'https://x/'+i})) },
]};
const noUrl = { id: 'n', body: [
  { type: 'p', text: 'word '.repeat(950) },
  { type: 'sources', items: [...Array.from({length:4},(_,i)=>({title:'t'+i,url:'https://x/'+i})), {title:'bare'}] },
]};
const emptyLab = { id: 'l', body: [
  { type: 'p', text: 'word '.repeat(950) },
  { type: 'lab', code: '   ' },
  { type: 'sources', items: Array.from({length:5},(_,i)=>({title:'t'+i,url:'https://x/'+i})) },
]};

const cases = [['good',good,true],['too few sources',thin,false],['too short',short,false],
               ['source without url',noUrl,false],['empty lab',emptyLab,false]];
let fails = 0;
for (const [name, post, shouldPass] of cases) {
  const passed = meetsBar(post);
  const ok = passed === shouldPass;
  if (!ok) fails++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name.padEnd(20)} passes=${passed}  ${blockingIssues(post).join('; ')}`);
  if (!shouldPass && !gate(post).draft) { console.log('     FAIL: gate did not set draft'); fails++; }
}
console.log(fails ? `\n${fails} gate test(s) failed` : '\nall gate tests passed');
process.exit(fails ? 1 : 0);
