import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook for public pages to load published content from the page builder.
 * Non-blocking: pages render their hardcoded JSX immediately.
 * Only switches to builder content after it successfully loads.
 */
export function usePublicPage(slug) {
  const [content, setContent] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Try Supabase
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('page_content')
            .select('craft_state')
            .eq('page_slug', slug)
            .eq('is_published', true)
            .single();

          if (!error && !cancelled && data?.craft_state) {
            setContent(data.craft_state);
            return;
          }
        } catch {
          // Supabase failed, fall through
        }
      }

      // Fallback: check localStorage
      try {
        const local = localStorage.getItem(`page_content_${slug}`);
        if (local) {
          const parsed = JSON.parse(local);
          if (!cancelled && parsed.is_published && parsed.craft_state) {
            setContent(parsed.craft_state);
          }
        }
      } catch {
        // Ignore
      }
    }

    load();
    return () => { cancelled = true; };
  }, [slug]);

  // Never block rendering — loading is always false
  return { content, loading: false };
}
