import { SERIES_POSTS } from './seriesPosts';
import { EMBEDDED_POSTS } from './embeddedPosts';
import { AI_SERIES_POSTS } from './aiSeriesPosts';
import { BLOG_COVERS } from './blogCovers';

const GRAD = 'linear-gradient(120deg, #0066CC 0%, #004D99 48%, #003366 100%)';
const EMBEDDED_GRAD = 'linear-gradient(120deg, #004D99 0%, #0066CC 50%, #003366 100%)';

// Turn a data-driven series post into blog-list metadata (strips the body).
// Full day-level date, e.g. "Jun 24, 2026".
const fullDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

const seriesMeta = SERIES_POSTS.map((p) => ({
  id: p.id,
  title: p.title,
  excerpt: p.excerpt,
  category: p.category || 'AI',
  date: fullDate(p.publishAt),
  readTime: p.readTime || '5 min read',
  tags: p.tags || [],
  series: 'AI Engineering Series',
  seriesNum: p.seriesNum,
  route: `/blog/${p.id}`,
  coverGradient: GRAD,
  publishAt: p.publishAt,
  draft: p.draft,
}));

const embeddedMeta = EMBEDDED_POSTS.map((p) => ({
  id: p.id,
  title: p.title,
  excerpt: p.excerpt,
  category: p.category || 'Hardware',
  date: fullDate(p.publishAt),
  readTime: p.readTime || '5 min read',
  tags: p.tags || [],
  series: p.series || 'Embedded Systems Series',
  seriesNum: p.seriesNum,
  route: `/blog/${p.id}`,
  coverGradient: EMBEDDED_GRAD,
  publishAt: p.publishAt,
  draft: p.draft,
  comingSoon: p.comingSoon,
}));

const aiSeriesMeta = AI_SERIES_POSTS.map((p) => ({
  id: p.id,
  title: p.title,
  excerpt: p.excerpt,
  category: p.category || 'AI',
  date: fullDate(p.publishAt),
  readTime: p.readTime || '8 min read',
  tags: p.tags || [],
  series: 'AI Engineering Series',
  seriesNum: p.seriesNum,
  route: `/blog/${p.id}`,
  coverGradient: GRAD,
  publishAt: p.publishAt,
  draft: p.draft,
}));

const CORE_POSTS = [
  {
    id: 'your-first-ai-agent',
    title: 'Your First AI Agent in 50 Lines of Python',
    excerpt: 'Build a ReAct agent from scratch using Claude\'s tool use API. No frameworks. No LangChain. Just raw function calling.',
    category: 'AI',
    date: 'Mar 15, 2026',
    readTime: '5 min read',
    tags: ['Claude API', 'Python', 'AI Agents'],
    series: 'AI Engineering Series',
    seriesNum: 1,
    route: '/blog/your-first-ai-agent',
    coverGradient: 'linear-gradient(120deg, #0066CC 0%, #004D99 48%, #003366 100%)',
    publishAt: '2026-03-15T12:00:00Z',
  },
  {
    id: 'next-word-sampling',
    title: 'How a language model picks the next word',
    excerpt:
      'Temperature, top-k, and top-p, explained by doing. Includes an interactive lab and runnable NumPy you can edit in the browser.',
    category: 'AI',
    date: 'Jun 25, 2026',
    readTime: '6 min read',
    tags: ['Sampling', 'Temperature', 'top-p', 'Foundation Models'],
    series: 'AI Engineering Series',
    seriesNum: 3,
    route: '/blog/next-word-sampling',
    coverGradient: 'linear-gradient(120deg, #0066CC 0%, #004D99 48%, #003366 100%)',
    publishAt: '2026-06-25T12:00:00Z', // test post — live now for review
  },
];

// Public list = hand-built posts + the data-driven series posts, newest first.
const sortKey = (p) => new Date(p.publishAt || 0).getTime();
export const BLOG_POSTS = [...CORE_POSTS, ...seriesMeta, ...embeddedMeta, ...aiSeriesMeta]
  .map((p) => ({ ...p, coverImage: p.coverImage || BLOG_COVERS[p.id] || null }))
  .sort((a, b) => sortKey(b) - sortKey(a));
