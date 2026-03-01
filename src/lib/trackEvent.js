import { supabase } from './supabase';

export async function trackEvent(eventType, metadata = {}) {
  if (!supabase) return;

  try {
    await supabase.from('analytics_events').insert({
      event_type: eventType,
      page_path: window.location.pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      metadata
    });
  } catch {
    // Silent fail -analytics should never break the app
  }
}
