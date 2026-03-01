import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const DATE_RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

export default function AdminAnalytics() {
  const [range, setRange] = useState(7);
  const [data, setData] = useState({ pageViews: [], topPages: [], referrers: [], totalViews: 0 });
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

      setData({
        totalViews: events.length,
        topPages,
        referrers,
        pageViews: events
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
