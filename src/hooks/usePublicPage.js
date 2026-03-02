import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook for public pages to load published content from the page builder.
 * Returns { content, loading } where content is the serialized Craft.js state.
 * If no published content exists, returns null (page should render its hardcoded JSX).
 */
export function usePublicPage(slug) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Try Supabase first
      if (supabase) {
        try {
          const { data } = await supabase
            .from('page_content')
            .select('craft_state')
            .eq('page_slug', slug)
            .eq('is_published', true)
            .single();

          if (!cancelled && data?.craft_state) {
            setContent(data.craft_state);
            setLoading(false);
            return;
          }
        } catch {
          // Fall through to localStorage
        }
      }

      // Fallback: check localStorage
      try {
        const local = localStorage.getItem(`page_content_${slug}`);
        if (local) {
          const parsed = JSON.parse(local);
          if (!cancelled && parsed.is_published && parsed.craft_state) {
            setContent(parsed.craft_state);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Ignore parse errors
      }

      if (!cancelled) {
        setContent(null);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slug]);

  return { content, loading };
}
