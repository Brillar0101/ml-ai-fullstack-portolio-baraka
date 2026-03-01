import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PROJECTS, CATEGORIES } from '../../data/projects';

// Local storage key for persisting visibility overrides
const LOCAL_VISIBILITY_KEY = 'admin_project_visibility';

function getLocalVisibility() {
  try {
    const stored = localStorage.getItem(LOCAL_VISIBILITY_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveLocalVisibility(overrides) {
  localStorage.setItem(LOCAL_VISIBILITY_KEY, JSON.stringify(overrides));
}

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useLocal, setUseLocal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    if (!supabase) {
      loadLocalProjects();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error || !data) {
        loadLocalProjects();
      } else {
        setProjects(data);
      }
    } catch {
      loadLocalProjects();
    }
    setLoading(false);
  }

  function loadLocalProjects() {
    const overrides = getLocalVisibility();
    setProjects(PROJECTS.map(p => ({
      ...p,
      visible: overrides[p.id] !== undefined ? overrides[p.id] : (p.visible !== false)
    })));
    setUseLocal(true);
    setLoading(false);
  }

  async function toggleVisibility(project) {
    const newVisible = !project.visible;

    if (useLocal || !supabase) {
      // Local mode: update state + persist to localStorage
      setProjects(prev =>
        prev.map(p => p.id === project.id ? { ...p, visible: newVisible } : p)
      );
      const overrides = getLocalVisibility();
      overrides[project.id] = newVisible;
      saveLocalVisibility(overrides);
      return;
    }

    const { error } = await supabase
      .from('projects')
      .update({ visible: newVisible })
      .eq('id', project.id);

    if (!error) {
      setProjects(prev =>
        prev.map(p => p.id === project.id ? { ...p, visible: newVisible } : p)
      );
    }
  }

  async function updateCategory(project, newCategory) {
    if (useLocal || !supabase) return;

    const { error } = await supabase
      .from('projects')
      .update({ category: newCategory })
      .eq('id', project.id);

    if (!error) {
      setProjects(prev =>
        prev.map(p => p.id === project.id ? { ...p, category: newCategory } : p)
      );
    }
  }

  if (loading) {
    return <div className="admin-empty"><p>Loading...</p></div>;
  }

  return (
    <div>
      <h1 className="admin-page-title">Projects</h1>
      <p className="admin-page-desc">
        Manage project visibility and categories
        {useLocal && <span style={{ color: '#FFC107' }}> (Local mode: changes saved to browser)</span>}
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Category</th>
              <th>Tags</th>
              <th>Visible</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                  {project.title}
                  {project.featured && (
                    <span style={{
                      marginLeft: '8px',
                      padding: '2px 6px',
                      background: 'var(--primary)',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 600
                    }}>
                      Featured
                    </span>
                  )}
                </td>
                <td>
                  <select
                    className="admin-form-select"
                    value={project.category}
                    onChange={(e) => updateCategory(project, e.target.value)}
                    disabled={useLocal}
                    style={{ width: 'auto', padding: '6px 10px', fontSize: '13px' }}
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(project.tags || []).map((tag, i) => (
                      <span key={i} style={{
                        padding: '2px 8px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: 'var(--text-muted)'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <button
                    className={`toggle-switch ${project.visible ? 'on' : ''}`}
                    onClick={() => toggleVisibility(project)}
                    aria-label={`Toggle ${project.title} visibility`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
