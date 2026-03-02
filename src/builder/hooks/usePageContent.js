import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export function usePageContent(slug) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!supabase) {
      // Fallback: try localStorage
      const local = localStorage.getItem(`page_content_${slug}`);
      if (local) {
        try {
          setContent(JSON.parse(local));
        } catch { /* ignore */ }
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_slug', slug)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      setContent(data || null);
    } catch (err) {
      console.error('Failed to fetch page content:', err);
      setError(err.message);
      // Fallback to localStorage
      const local = localStorage.getItem(`page_content_${slug}`);
      if (local) {
        try {
          setContent(JSON.parse(local));
        } catch { /* ignore */ }
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) fetchContent();
  }, [slug, fetchContent]);

  const saveContent = useCallback(async (craftState) => {
    setSaving(true);
    setError(null);

    const payload = {
      page_slug: slug,
      page_title: slug === '/' ? 'Home' : slug.replace('/', '').replace(/^\w/, c => c.toUpperCase()),
      craft_state: craftState,
      updated_at: new Date().toISOString(),
    };

    // Always save to localStorage as backup
    localStorage.setItem(`page_content_${slug}`, JSON.stringify(payload));

    if (!supabase) {
      setContent(payload);
      setSaving(false);
      return { success: true };
    }

    try {
      const { data, error: upsertError } = await supabase
        .from('page_content')
        .upsert(payload, { onConflict: 'page_slug' })
        .select()
        .single();

      if (upsertError) throw upsertError;
      setContent(data);
      return { success: true };
    } catch (err) {
      console.error('Failed to save page content:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [slug]);

  const publishContent = useCallback(async () => {
    if (!supabase || !content?.id) return { success: false };

    try {
      const { error: pubError } = await supabase
        .from('page_content')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .eq('id', content.id);

      if (pubError) throw pubError;
      setContent(prev => ({ ...prev, is_published: true, published_at: new Date().toISOString() }));
      return { success: true };
    } catch (err) {
      console.error('Failed to publish:', err);
      return { success: false, error: err.message };
    }
  }, [content]);

  return { content, loading, saving, error, saveContent, publishContent, refetch: fetchContent };
}

export function usePublicPage(slug) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (supabase) {
        try {
          const { data } = await supabase
            .from('page_content')
            .select('craft_state')
            .eq('page_slug', slug)
            .eq('is_published', true)
            .single();

          if (data) {
            setContent(data.craft_state);
            setLoading(false);
            return;
          }
        } catch {
          // Fall through to localStorage
        }
      }

      // Fallback: check localStorage
      const local = localStorage.getItem(`page_content_${slug}`);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (parsed.is_published) {
            setContent(parsed.craft_state);
            setLoading(false);
            return;
          }
        } catch { /* ignore */ }
      }

      setContent(null);
      setLoading(false);
    }

    load();
  }, [slug]);

  return { content, loading };
}
