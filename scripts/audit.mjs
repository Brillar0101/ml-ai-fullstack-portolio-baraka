// Dev-only audit helper. Loads every block-array post directly (bypassing the
// Vite-resolved blog.js barrel) so scripts can inspect and verify post bodies.
import { SERIES_POSTS } from '../src/data/seriesPosts.js';
import { AI_SERIES_POSTS } from '../src/data/aiSeriesPosts.js';
import { readTimeFor } from '../src/lib/readTime.js';

export const ALL = [
  ...SERIES_POSTS.map((p) => ({ group: 'series', post: p })),
  ...AI_SERIES_POSTS.map((p) => ({ group: 'ai-series', post: p })),
];

export { readTimeFor };

export function prose(post) {
  return post.body
    .map((b) => {
      if (b.type === 'p' || b.type === 'h2') return b.text || '';
      if (b.type === 'callout') return `${b.title || ''} ${b.text || ''}`;
      if (b.type === 'ul') return (b.items || []).join(' ');
      if (b.type === 'terms') return (b.items || []).map((i) => `${i.term} ${i.def}`).join(' ');
      if (b.type === 'image' || b.type === 'diagram') return `${b.title || ''} ${b.caption || ''}`;
      return '';
    })
    .join('\n');
}

export function words(post) {
  return prose(post).split(/\s+/).filter(Boolean).length;
}
