import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PROJECTS, CATEGORIES } from '../data/projects';

export function useProjects(category = 'all') {
  const [projects, setProjects] = useState([]);
  const [categories] = useState(CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);

      // Try Supabase first
      if (supabase) {
        try {
          let query = supabase
            .from('projects')
            .select('*')
            .eq('visible', true)
            .order('sort_order', { ascending: true });

          if (category !== 'all') {
            query = query.eq('category', category);
          }

          const { data, error } = await query;

          if (!error && data) {
            setProjects(data);
            setLoading(false);
            return;
          }
        } catch {
          // Fall through to static data
        }
      }

      // Fallback to static data (filter out hidden projects)
      // Check localStorage for admin visibility overrides
      let overrides = {};
      try {
        const stored = localStorage.getItem('admin_project_visibility');
        if (stored) overrides = JSON.parse(stored);
      } catch { /* ignore */ }

      const visible = PROJECTS.filter(p => {
        if (overrides[p.id] !== undefined) return overrides[p.id];
        return p.visible !== false;
      });
      const filtered = category === 'all'
        ? visible
        : visible.filter(p => p.category === category);
      setProjects(filtered);
      setLoading(false);
    }

    fetchProjects();
  }, [category]);

  return { projects, categories, loading };
}
