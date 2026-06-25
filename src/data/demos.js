// Interactive demos for the AI Engineering series.
//
// Each demo maps to a component in src/pages/demos/ and the slug→component map
// in App.jsx. `publishAt` controls the drip: a demo only appears in the listing
// once its date has arrived (see src/lib/publishing.js). The full series will be
// scheduled across the rest of the year; for now only the test demo is live and
// the rest are drafts so you can review before the drip starts.

export const DEMOS = [
  {
    id: 'sampling',
    title: 'How a model picks the next word',
    excerpt:
      'Temperature, top-k, and top-p, as live sliders. Watch one model go from cautious to chaotic, then run the same algorithm in real Python in your browser.',
    chapter: 'Chapter 2 · Understanding Foundation Models',
    tags: ['Sampling', 'Temperature', 'top-k', 'top-p', 'NumPy'],
    route: '/demos/sampling',
    runnable: true,
    publishAt: '2026-06-25T12:00:00Z', // test demo — live now for review
  },
  // ---- Upcoming (drafts; scheduled later across the series) ----
  {
    id: 'tokenization',
    title: 'Why your prompt costs what it costs',
    excerpt: 'Type any text and watch it split into tokens. See why "strawberry" is three tokens and spaces matter.',
    chapter: 'Chapter 2 · Understanding Foundation Models',
    tags: ['Tokenization', 'BPE'],
    route: '/demos/tokenization',
    draft: true,
  },
  {
    id: 'perplexity',
    title: 'Measuring how surprised a model is',
    excerpt: 'Cross-entropy and perplexity built up from scratch, with a runnable lab on real text.',
    chapter: 'Chapter 3 · Evaluation Methodology',
    tags: ['Perplexity', 'Cross-entropy', 'Entropy'],
    route: '/demos/perplexity',
    draft: true,
  },
  {
    id: 'embeddings-search',
    title: 'Search by meaning, not by keyword',
    excerpt: 'Cosine similarity over sentence embeddings, the engine inside every RAG system.',
    chapter: 'Chapter 6 · RAG and Agents',
    tags: ['Embeddings', 'Cosine similarity', 'RAG'],
    route: '/demos/embeddings-search',
    draft: true,
  },
];
