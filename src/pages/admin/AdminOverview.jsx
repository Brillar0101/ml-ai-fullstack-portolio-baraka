import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminOverview() {
  const [stats, setStats] = useState({ views7d: 0, totalViews: 0, topPages: [], recentEvents: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Views in last 7 days
      const { count: views7d } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .gte('created_at', sevenDaysAgo);

      // Total views
      const { count: totalViews } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view');

      // Recent events
      const { data: recentEvents } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        views7d: views7d || 0,
        totalViews: totalViews || 0,
        topPages: [],
        recentEvents: recentEvents || []
      });
    } catch {
      // Silent fail
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="admin-empty"><p>Loading...</p></div>;
  }

  return (
    <div>
      <h1 className="admin-page-title">Overview</h1>
      <p className="admin-page-desc">Portfolio analytics summary</p>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Views (7 days)</div>
          <div className="admin-stat-value">{stats.views7d}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total views</div>
          <div className="admin-stat-value">{stats.totalViews}</div>
        </div>
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
        Recent Activity
      </h2>

      {stats.recentEvents.length === 0 ? (
        <div className="admin-empty">
          <p>No events recorded yet. Visit the public site to generate analytics.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Page</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.event_type}</td>
                  <td>{event.page_path}</td>
                  <td>{new Date(event.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
