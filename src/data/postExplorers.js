// Interactive explorers, attached the same way diagrams are.
//
// Every frame below was produced by actually running the retrieval in
// scripts/gen-topk-explorer.py, not written by hand to look plausible. The
// widget lets a reader drag the parameter; it does not let it invent numbers.
export const EXPLORERS = [
  {
    post: 'cag-vs-rag',
    before: { h2: 'Where the KV cache does the heavy lifting' },
    block: {
      type: 'explorer',
      title: 'Drag top-k and watch what you gain and lose',
      param: { label: 'passages retrieved (top-k)', steps: [1, 2, 3, 4, 5, 6] },
      bars: { max: 100, unit: '' },
      caption: 'Coverage is what the answer needs; relevance is how much of what you sent was worth sending. There is no k that maximises both, which is the trade CAG sidesteps by never dropping anything.',
      data: {
    1: { note: 'The answer needs two facts. Only 1 retrieved, so no prompt can fix this.',
        items: [{ label: 'answer coverage', value: 50, state: 'bad' }, { label: 'relevant passages', value: 100, state: 'good' }, { label: 'passages sent', value: 1, state: 'neutral' }] },
    2: { note: 'Both facts present with 0 irrelevant passages. This is the useful range.',
        items: [{ label: 'answer coverage', value: 100, state: 'good' }, { label: 'relevant passages', value: 100, state: 'good' }, { label: 'passages sent', value: 2, state: 'neutral' }] },
    3: { note: 'Both facts present with 1 irrelevant passage. This is the useful range.',
        items: [{ label: 'answer coverage', value: 100, state: 'good' }, { label: 'relevant passages', value: 67, state: 'good' }, { label: 'passages sent', value: 3, state: 'neutral' }] },
    4: { note: 'Both facts present with 2 irrelevant passages. This is the useful range.',
        items: [{ label: 'answer coverage', value: 100, state: 'good' }, { label: 'relevant passages', value: 50, state: 'warn' }, { label: 'passages sent', value: 4, state: 'warn' }] },
    5: { note: 'Both facts are here, and so are 3 passages about nothing you asked. That is context you pay for and the model must read past.',
        items: [{ label: 'answer coverage', value: 100, state: 'good' }, { label: 'relevant passages', value: 40, state: 'warn' }, { label: 'passages sent', value: 5, state: 'warn' }] },
    6: { note: 'Both facts are here, and so are 4 passages about nothing you asked. That is context you pay for and the model must read past.',
        items: [{ label: 'answer coverage', value: 100, state: 'good' }, { label: 'relevant passages', value: 33, state: 'bad' }, { label: 'passages sent', value: 6, state: 'warn' }] },
      },
    },
  },
];
