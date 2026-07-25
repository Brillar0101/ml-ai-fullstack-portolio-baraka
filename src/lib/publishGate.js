// The bar a post has to clear before the site will show it.
//
// The policy is deliberately blunt: it is better to publish nothing than to
// publish something thin or unverifiable. A post that fails any check below is
// held back as a draft rather than shipped with a gap in it, and the reason is
// reported by scripts/publish-report.mjs so it can be fixed rather than
// forgotten.
//
// This runs at import time over the real post data, so a post cannot regress
// into being published by accident: delete its sources and it drops out.

export const RULES = {
  // Enough verified references that a reader can go check the claims.
  MIN_SOURCES: 5,
  // Below this a post is a note, not an article.
  MIN_WORDS: 900,
  // Every source needs somewhere to point.
  SOURCES_NEED_URLS: true,
};

function bodyWords(post) {
  return (post.body || [])
    .map((b) => {
      if (b.type === 'p' || b.type === 'h2') return b.text || '';
      if (b.type === 'callout') return `${b.title || ''} ${b.text || ''}`;
      if (b.type === 'ul') return (b.items || []).join(' ');
      if (b.type === 'terms') return (b.items || []).map((i) => `${i.term} ${i.def}`).join(' ');
      return '';
    })
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

/**
 * Reasons this post is not fit to publish. An empty array means it passes.
 * @param {object} post
 * @returns {string[]}
 */
export function blockingIssues(post) {
  const issues = [];
  if (!Array.isArray(post.body) || post.body.length === 0) {
    issues.push('no body');
    return issues;
  }

  const sources = post.body.find((b) => b.type === 'sources');
  const count = sources ? sources.items.length : 0;
  if (count < RULES.MIN_SOURCES) {
    issues.push(`only ${count} source${count === 1 ? '' : 's'}, needs ${RULES.MIN_SOURCES}`);
  }
  if (RULES.SOURCES_NEED_URLS && sources && sources.items.some((s) => !s.url)) {
    issues.push('a source has no url');
  }

  const words = bodyWords(post);
  if (words < RULES.MIN_WORDS) {
    issues.push(`${words} words, needs ${RULES.MIN_WORDS}`);
  }

  // A lab that ships without code is a Run button that does nothing.
  if (post.body.some((b) => b.type === 'lab' && !String(b.code || '').trim())) {
    issues.push('a lab has no code');
  }

  return issues;
}

/** True when a post is good enough to show. */
export function meetsBar(post) {
  return blockingIssues(post).length === 0;
}

/**
 * Mark posts that fail the bar as drafts. Anything already marked draft by
 * hand stays a draft; this only ever hides, never reveals.
 */
export function gate(post) {
  if (post.draft) return post;
  const issues = blockingIssues(post);
  return issues.length ? { ...post, draft: true, heldBack: issues } : post;
}
