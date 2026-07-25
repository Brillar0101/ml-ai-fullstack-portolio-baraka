// Date-gated drip publishing.
//
// Every blog post carries a `publishAt` ISO date. The site only shows
// an item once that date has arrived, so content publishes itself one piece at a
// time with no server, no cron, and no manual step. Spread the dates across the
// year and everything is live by December 31 on its own.
//
// An item with no `publishAt` is treated as already published (legacy posts).
// Set `draft: true` to hide an item regardless of date.

// Preview mode: `?preview` on any post URL shows it regardless of its date,
// so scheduled work can be reviewed before it goes live. It never affects the
// blog index or what a normal visitor sees, and a drafted item stays hidden.
export function isPreviewing() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('preview');
}

export function isPublished(item, now = new Date()) {
  if (!item) return false;
  if (item.draft) return false;
  if (isPreviewing()) return true;
  if (!item.publishAt) return true;
  const when = new Date(item.publishAt);
  if (Number.isNaN(when.getTime())) return true;
  return when.getTime() <= now.getTime();
}

export function publishedItems(items, now = new Date()) {
  return (items || []).filter((it) => isPublished(it, now));
}

// Spread N items evenly from `start` to `end` (inclusive-ish), returning an
// array of ISO date strings. Useful for assigning a whole series at once:
//   const dates = scheduleEvenly(items.length, '2026-07-01', '2026-12-31');
// `everyOtherDay` caps the cadence at one item per 2 days if that finishes
// before `end`; otherwise it stretches to fit them all in by `end`.
export function scheduleEvenly(count, startISO, endISO, { everyOtherDay = true } = {}) {
  if (count <= 0) return [];
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  const span = Math.max(end - start, 0);
  const DAY = 24 * 60 * 60 * 1000;

  // Preferred cadence: one item every other day.
  const preferredStep = everyOtherDay ? 2 * DAY : DAY;
  const neededSpan = (count - 1) * preferredStep;

  // Use the tighter of (every other day) or (whatever fits before `end`).
  const step = neededSpan <= span || count === 1 ? preferredStep : span / (count - 1);

  return Array.from({ length: count }, (_, i) => new Date(start + Math.round(i * step)).toISOString());
}
