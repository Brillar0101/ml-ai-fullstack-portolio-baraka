// Attach each post's verified sources block at import time.
//
// The references live in one place (sources-map.js, built on sources-library.js)
// rather than being copied into 73 hand-written blocks. That keeps every URL in
// a single list that scripts/verify-sources.mjs can check against the live web
// in one pass, and it makes "does every post have enough sources?" a question
// with a checkable answer instead of a manual audit.
//
// A post with no entry in the map keeps whatever sources it already had. The
// publish gate in ../lib/publishGate.js decides whether that is enough to ship.
import { SOURCES } from './sources-map';
import { TERM_LINKS } from './termLinks';
import { DIAGRAMS } from './postDiagrams';
import { gate } from '../lib/publishGate';

// Give a defined term its reference link, unless the post already set one.
function linkTerms(block) {
  if (block.type !== 'terms') return block;
  let changed = false;
  const items = block.items.map((item) => {
    if (item.url) return item;
    const url = TERM_LINKS[item.term.toLowerCase()];
    if (!url) return item;
    changed = true;
    return { ...item, url };
  });
  return changed ? { ...block, items } : block;
}

// Drop a post's diagram in at its declared position. Placement is by heading
// text rather than index, so inserting or splitting a paragraph elsewhere in
// the post cannot silently move the diagram somewhere it makes no sense.
function insertDiagram(body, postId) {
  const entry = DIAGRAMS.find((d) => d.post === postId);
  if (!entry) return body;
  if (body.some((b) => b.type === 'diagram')) return body;   // already has one

  const at = entry.before.h2
    ? body.findIndex((b) => b.type === 'h2' && b.text === entry.before.h2)
    : body.findIndex((b) => b.type === entry.before.type);

  if (at === -1) return [...body, entry.diagram];            // anchor moved: append
  return [...body.slice(0, at), entry.diagram, ...body.slice(at)];
}

/**
 * Return a copy of `post` with its verified sources block at the end, its
 * defined terms linked to authoritative references, and its diagram in place. Any sources block already
 * in the body is replaced, so the map is the single source of truth and stale
 * inline lists cannot drift.
 */
export function attachSources(post) {
  if (!Array.isArray(post.body)) return post;
  const items = SOURCES[post.id];

  const body = insertDiagram(
    post.body.filter((b) => b.type !== 'sources').map(linkTerms),
    post.id,
  );

  if (items) body.push({ type: 'sources', items });
  else {
    const existing = post.body.find((b) => b.type === 'sources');
    if (existing) body.push(existing);
  }
  // Anything that does not clear the bar is held back rather than shipped thin.
  return gate({ ...post, body });
}
