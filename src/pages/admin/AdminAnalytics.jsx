import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BLOG_POSTS } from '../../data/blog';

const DATE_RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

// Seconds -> "1m 20s" / "45s".
const fmtTime = (s) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);

export default function AdminAnalytics() {
  const [range, setRange] = useState(7);
  const [data, setData] = useState({
    pageViews: [], topPages: [], referrers: [], totalViews: 0, blogStats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  async function fetchAnalytics() {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString();

    try {
      // Get all page view events in range
      const { data: events } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'page_view')
        .gte('created_at', since)
        .order('created_at', { ascending: true });

      if (!events) {
        setLoading(false);
        return;
      }

      // Aggregate top pages
      const pageCounts = {};
      const referrerCounts = {};

      events.forEach(event => {
        const path = event.page_path || '/';
        pageCounts[path] = (pageCounts[path] || 0) + 1;

        if (event.referrer) {
          try {
            const ref = new URL(event.referrer).hostname;
            referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
          } catch {
            // Invalid URL
          }
        }
      });

      const topPages = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, count]) => ({ path, count }));

      const referrers = Object.entries(referrerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([host, count]) => ({ host, count }));

      // Per-blog views, derived from /blog/<slug> page paths.
      const blogViews = {};
      events.forEach(event => {
        const path = event.page_path || '';
        if (path.startsWith('/blog/')) {
          const slug = path.slice('/blog/'.length).replace(/\/+$/, '');
          if (slug) blogViews[slug] = (blogViews[slug] || 0) + 1;
        }
      });

      // Engagement (scroll depth + time on page), averaged per post.
      const { data: engagement } = await supabase
        .from('analytics_events')
        .select('post_slug, scroll_depth, time_on_page')
        .eq('event_type', 'engagement')
        .gte('created_at', since);

      const engBySlug = {};
      (engagement || []).forEach(e => {
        if (!e.post_slug) return;
        if (!engBySlug[e.post_slug]) engBySlug[e.post_slug] = { time: 0, scroll: 0, n: 0 };
        engBySlug[e.post_slug].time += e.time_on_page || 0;
        engBySlug[e.post_slug].scroll += e.scroll_depth || 0;
        engBySlug[e.post_slug].n += 1;
      });

      const blogStats = Object.entries(blogViews)
        .map(([slug, views]) => {
          const post = BLOG_POSTS.find(p => p.id === slug);
          const e = engBySlug[slug];
          return {
            slug,
            title: post ? post.title : slug,
            views,
            avgTime: e && e.n ? Math.round(e.time / e.n) : null,
            avgScroll: e && e.n ? Math.round(e.scroll / e.n) : null,
          };
        })
        .sort((a, b) => b.views - a.views);

      setData({
        totalViews: events.length,
        topPages,
        referrers,
        pageViews: events,
        blogStats,
      });
    } catch {
      // Silent fail
    }
    setLoading(false);
  }

  const maxPageCount = data.topPages.length > 0 ? data.topPages[0].count : 1;
  const maxRefCount = data.referrers.length > 0 ? data.referrers[0].count : 1;

  return (
    <div>
      <h1 className="admin-page-title">Analytics</h1>
      <p className="admin-page-desc">Page views and traffic sources</p>

      <div className="admin-date-filter">
        {DATE_RANGES.map(({ label, days }) => (
          <button
            key={days}
            className={`admin-date-btn ${range === days ? 'active' : ''}`}
            onClick={() => setRange(days)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-empty"><p>Loading analytics...</p></div>
      ) : (
        <>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-label">Page views ({range}d)</div>
              <div className="admin-stat-value">{data.totalViews}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Unique pages visited</div>
              <div className="admin-stat-value">{data.topPages.length}</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-label">Traffic sources</div>
              <div className="admin-stat-value">{data.referrers.length}</div>
            </div>
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
            Blog posts
          </h2>
          {data.blogStats.length === 0 ? (
            <div className="admin-empty" style={{ marginBottom: '32px' }}>
              <p>No blog views in this period.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <th style={{ padding: '8px 0' }}>Post</th>
                  <th style={{ padding: '8px 0', textAlign: 'right' }}>Views</th>
                  <th style={{ padding: '8px 0', textAlign: 'right' }}>Avg time</th>
                  <th style={{ padding: '8px 0', textAlign: 'right' }}>Avg scroll</th>
                </tr>
              </thead>
              <tbody>
                {data.blogStats.map(b => (
                  <tr key={b.slug} style={{ borderTop: '1px solid var(--border, rgba(255,255,255,0.08))' }}>
                    <td style={{ padding: '10px 0', color: 'var(--text)' }} title={b.slug}>{b.title}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', color: 'var(--text)' }}>{b.views}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {b.avgTime != null ? fmtTime(b.avgTime) : '—'}
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {b.avgScroll != null ? `${b.avgScroll}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
            Top Pages
          </h2>
          {data.topPages.length === 0 ? (
            <div className="admin-empty"><p>No page views in this period.</p></div>
          ) : (
            <div className="admin-bar-chart" style={{ marginBottom: '32px' }}>
              {data.topPages.map(({ path, count }) => (
                <div key={path} className="admin-bar-row">
                  <span className="admin-bar-label" title={path}>{path}</span>
                  <div className="admin-bar-track">
                    <div
                      className="admin-bar-fill"
                      style={{ width: `${(count / maxPageCount) * 100}%` }}
                    />
                  </div>
                  <span className="admin-bar-count">{count}</span>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
            Referrers
          </h2>
          {data.referrers.length === 0 ? (
            <div className="admin-empty"><p>No referrer data in this period.</p></div>
          ) : (
            <div className="admin-bar-chart">
              {data.referrers.map(({ host, count }) => (
                <div key={host} className="admin-bar-row">
                  <span className="admin-bar-label" title={host}>{host}</span>
                  <div className="admin-bar-track">
                    <div
                      className="admin-bar-fill"
                      style={{ width: `${(count / maxRefCount) * 100}%` }}
                    />
                  </div>
                  <span className="admin-bar-count">{count}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
