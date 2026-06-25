import { SERIES_POSTS } from './seriesPosts';

const GRAD = 'linear-gradient(120deg, #0068FF 0%, #3539F4 48%, #BD03F7 100%)';

// Turn a data-driven series post into blog-list metadata (strips the body).
const monthLabel = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
};

const seriesMeta = SERIES_POSTS.map((p) => ({
  id: p.id,
  title: p.title,
  excerpt: p.excerpt,
  category: p.category || 'AI',
  date: monthLabel(p.publishAt),
  readTime: p.readTime || '5 min read',
  tags: p.tags || [],
  series: 'AI Engineering Series',
  seriesNum: p.seriesNum,
  route: `/blog/${p.id}`,
  coverGradient: GRAD,
  demo: p.demo,
  publishAt: p.publishAt,
  draft: p.draft,
}));

const CORE_POSTS = [
  {
    id: 'your-first-ai-agent',
    title: 'Your First AI Agent in 50 Lines of Python',
    excerpt: 'Build a ReAct agent from scratch using Claude\'s tool use API. No frameworks. No LangChain. Just raw function calling.',
    category: 'AI',
    date: 'March 2026',
    readTime: '5 min read',
    tags: ['Claude API', 'Python', 'AI Agents'],
    series: 'AI Engineering Series',
    seriesNum: 1,
    route: '/blog/your-first-ai-agent',
    coverGradient: 'linear-gradient(120deg, #0068FF 0%, #3539F4 48%, #BD03F7 100%)',
    publishAt: '2026-03-15T12:00:00Z',
  },
  {
    id: 'next-word-sampling',
    title: 'How a language model picks the next word',
    excerpt:
      'Temperature, top-k, and top-p, explained by doing. Includes an interactive lab and runnable NumPy you can edit in the browser.',
    category: 'AI',
    date: 'June 2026',
    readTime: '6 min read',
    tags: ['Sampling', 'Temperature', 'top-p', 'Foundation Models'],
    series: 'AI Engineering Series',
    seriesNum: 3,
    route: '/blog/next-word-sampling',
    coverGradient: 'linear-gradient(120deg, #0068FF 0%, #3539F4 48%, #BD03F7 100%)',
    demo: '/demos/sampling',
    publishAt: '2026-06-25T12:00:00Z', // test post — live now for review
  },
];

// Public list = hand-built posts + the data-driven series posts, newest first.
const sortKey = (p) => new Date(p.publishAt || 0).getTime();
export const BLOG_POSTS = [...CORE_POSTS, ...seriesMeta].sort((a, b) => sortKey(b) - sortKey(a));
