import { supabase } from './supabase';
import { classifySource } from './trafficSource';

// Supabase caps a select at 1,000 rows by default, which silently truncated
// every total above that. Page through until a short page comes back.
const PAGE = 1000;
const MAX_ROWS = 50000;

async function fetchAll(eventType, columns, since) {
  const rows = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE) {
    const { data, error } = await supabase
      .from('analytics_events')
      .select(columns)
      .eq('event_type', eventType)
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

const countBy = (items, keyOf) => items.reduce((acc, item) => {
  const key = keyOf(item);
  if (key) acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

const top = (counts, n = 10) => Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, n)
  .map(([key, count]) => ({ key, count }));

/**
 * Load and aggregate traffic for the last `hours`.
 * @param {number} hours
 * @param {Array<{id: string, title: string}>} posts
 */
export async function loadAnalytics(hours, posts) {
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  const [views, engagement] = await Promise.all([
    fetchAll('page_view', 'page_path, referrer, metadata, created_at', since),
    fetchAll('engagement', 'post_slug, scroll_depth, time_on_page', since),
  ]);

  const ownHost = window.location.hostname;
  const sessions = new Set(views.map((v) => v.metadata?.session).filter(Boolean));
  const landings = views.filter((v) => v.metadata?.landing);
  const sources = landings.map((v) => classifySource(v, ownHost));
  const recentCutoff = Date.now() - 30 * 60 * 1000;
  const activeNow = new Set(views
    .filter((v) => new Date(v.created_at).getTime() >= recentCutoff)
    .map((v) => v.metadata?.session)
    .filter(Boolean)).size;

  const blogViews = countBy(views, (v) => {
    const path = v.page_path || '';
    return path.startsWith('/blog/') ? path.slice(6).replace(/\/+$/, '') : null;
  });
  const eng = engagement.reduce((acc, e) => {
    if (!e.post_slug) return acc;
    const cur = acc[e.post_slug] || { time: 0, scroll: 0, n: 0 };
    return { ...acc, [e.post_slug]: { time: cur.time + (e.time_on_page || 0), scroll: cur.scroll + (e.scroll_depth || 0), n: cur.n + 1 } };
  }, {});
  const blogStats = Object.entries(blogViews)
    .map(([slug, count]) => {
      const post = posts.find((p) => p.id === slug);
      const e = eng[slug];
      return {
        slug,
        title: post ? post.title : slug,
        views: count,
        avgTime: e?.n ? Math.round(e.time / e.n) : null,
        avgScroll: e?.n ? Math.round(e.scroll / e.n) : null,
      };
    })
    .sort((a, b) => b.views - a.views);

  return {
    totalViews: views.length,
    visits: sessions.size,
    activeNow,
    topPages: top(countBy(views, (v) => v.page_path || '/')),
    channels: top(countBy(sources, (s) => s.channel)),
    aiSources: top(countBy(sources.filter((s) => s.channel === 'AI assistant'), (s) => s.source)),
    referrers: top(countBy(sources.filter((s) => s.channel !== 'Direct'), (s) => s.source)),
    blogStats,
  };
}
