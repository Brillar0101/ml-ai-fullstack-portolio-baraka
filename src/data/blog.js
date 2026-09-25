import { SERIES_POSTS } from './seriesPosts';
import { EMBEDDED_POSTS } from './embeddedPosts';
import { AI_SERIES_POSTS } from './aiSeriesPosts';
import { BLOG_COVERS } from './blogCovers';
import { readTimeFor } from '../lib/readTime';

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
  readTime: readTimeFor(p.body),
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
  readTime: readTimeFor(p.body),
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
  readTime: readTimeFor(p.body),
  tags: p.tags || [],
  series: 'AI Engineering Series',
  seriesNum: p.seriesNum,
  route: `/blog/${p.id}`,
  coverGradient: GRAD,
  publishAt: p.publishAt,
  draft: p.draft,
}));

// Every post is now a data-driven block array (series, embedded, or AI
// series). The hand-built component posts were converted to content/series/.
const CORE_POSTS = [];

// Public list = hand-built posts + the data-driven series posts, newest first.
const sortKey = (p) => new Date(p.publishAt || 0).getTime();
export const BLOG_POSTS = [...CORE_POSTS, ...seriesMeta, ...embeddedMeta, ...aiSeriesMeta]
  .map((p) => ({ ...p, coverImage: p.coverImage || BLOG_COVERS[p.id] || null }))
  .sort((a, b) => sortKey(b) - sortKey(a));
