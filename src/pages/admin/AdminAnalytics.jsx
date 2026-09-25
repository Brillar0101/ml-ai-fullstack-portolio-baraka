import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { loadAnalytics } from '../../lib/analyticsQuery';
import { BLOG_POSTS } from '../../data/blog';

const RANGES = [
  { label: '24h', hours: 24 },
  { label: '7d', hours: 24 * 7 },
  { label: '30d', hours: 24 * 30 },
  { label: '90d', hours: 24 * 90 },
];
// The 24h view is the "what is happening now" view, so keep it fresh.
const LIVE_REFRESH_MS = 60 * 1000;

const fmtTime = (s) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);
const H2 = { fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' };
const EMPTY = {
  totalViews: 0, visits: 0, activeNow: 0, topPages: [], channels: [], aiSources: [], referrers: [], blogStats: [],
};

function BarList({ rows, empty }) {
  if (rows.length === 0) return <div className="admin-empty" style={{ marginBottom: '32px' }}><p>{empty}</p></div>;
  const max = rows[0].count;
  return (
    <div className="admin-bar-chart" style={{ marginBottom: '32px' }}>
      {rows.map(({ key, count }) => (
        <div key={key} className="admin-bar-row">
          <span className="admin-bar-label" title={key}>{key}</span>
          <div className="admin-bar-track">
            <div className="admin-bar-fill" style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <span className="admin-bar-count">{count}</span>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{value}</div>
    </div>
  );
}

function BlogTable({ rows }) {
  if (rows.length === 0) return <div className="admin-empty" style={{ marginBottom: '32px' }}><p>No blog views in this period.</p></div>;
  const cell = { padding: '10px 0', textAlign: 'right' };
  return (
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
        {rows.map((b) => (
          <tr key={b.slug} style={{ borderTop: '1px solid var(--border, rgba(255,255,255,0.08))' }}>
            <td style={{ padding: '10px 0', color: 'var(--text)' }} title={b.slug}>{b.title}</td>
            <td style={{ ...cell, color: 'var(--text)' }}>{b.views}</td>
            <td style={{ ...cell, color: 'var(--text-muted)' }}>{b.avgTime != null ? fmtTime(b.avgTime) : 'n/a'}</td>
            <td style={{ ...cell, color: 'var(--text-muted)' }}>{b.avgScroll != null ? `${b.avgScroll}%` : 'n/a'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AdminAnalytics() {
  const [hours, setHours] = useState(24);
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setError('Supabase is not configured, so there is no analytics data to show.');
      setLoading(false);
      return;
    }
    try {
      setData(await loadAnalytics(hours, BLOG_POSTS));
      setError('');
      setUpdatedAt(new Date());
    } catch (e) {
      setError(`Could not load analytics: ${e.message}`);
    }
    setLoading(false);
  }, [hours]);

  useEffect(() => {
    setLoading(true);
    refresh();
    if (hours !== 24) return undefined;
    const timer = setInterval(refresh, LIVE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [hours, refresh]);

  return (
    <div>
      <h1 className="admin-page-title">Analytics</h1>
      <p className="admin-page-desc">
        Visits, blog engagement, and where readers come from
        {updatedAt ? `. Updated ${updatedAt.toLocaleTimeString()}` : ''}
        {hours === 24 ? ', refreshing every minute.' : '.'}
      </p>

      <div className="admin-date-filter">
        {RANGES.map(({ label, hours: h }) => (
          <button key={h} className={`admin-date-btn ${hours === h ? 'active' : ''}`} onClick={() => setHours(h)}>
            {label}
          </button>
        ))}
      </div>

      {error ? <div className="admin-empty"><p>{error}</p></div> : null}
      {loading ? (
        <div className="admin-empty"><p>Loading analytics...</p></div>
      ) : (
        <>
          <div className="admin-stats-grid">
            <Stat label="Reading now (30 min)" value={data.activeNow} />
            <Stat label="Visits" value={data.visits} />
            <Stat label="Page views" value={data.totalViews} />
            <Stat label="From AI assistants" value={data.channels.find((c) => c.key === 'AI assistant')?.count || 0} />
          </div>

          <h2 style={H2}>Blog posts</h2>
          <BlogTable rows={data.blogStats} />

          <h2 style={H2}>How visits arrived</h2>
          <BarList rows={data.channels} empty="No visits recorded in this period." />

          <h2 style={H2}>AI assistants</h2>
          <BarList rows={data.aiSources} empty="No visits from ChatGPT, Perplexity, Claude, Gemini, or Copilot yet." />

          <h2 style={H2}>Top referring sites</h2>
          <BarList rows={data.referrers} empty="No referrer data in this period." />

          <h2 style={H2}>Top pages</h2>
          <BarList rows={data.topPages} empty="No page views in this period." />
        </>
      )}
    </div>
  );
}
