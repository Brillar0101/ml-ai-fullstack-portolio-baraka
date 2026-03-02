import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook for public pages to load published content from the page builder.
 * Non-blocking: pages render their hardcoded JSX immediately.
 * Only switches to builder content after it successfully loads.
 */
export function usePublicPage(slug) {
  // Start with loading=false so pages render immediately
  const [content, setContent] = useState(null);
  const [loading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Try Supabase (non-blocking, with timeout)
      if (supabase) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 2000);

          const { data } = await supabase
            .from('page_content')
            .select('craft_state')
            .eq('page_slug', slug)
            .eq('is_published', true)
            .single()
            .abortSignal(controller.signal);

          clearTimeout(timeout);

          if (!cancelled && data?.craft_state) {
            setContent(data.craft_state);
            return;
          }
        } catch {
          // Supabase failed — that's fine, use hardcoded content
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

  return { content, loading };
}
