import { supabase } from './supabase';

const SESSION_KEY = 'pt_session';
const LANDING_KEY = 'pt_landing';

// A random id per browser tab session, kept in sessionStorage (not a cookie)
// so the dashboard can count visits instead of page loads. It is never tied
// to a person and disappears when the tab closes.
function sessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

// document.referrer never changes during client-side navigation, so sending it
// on every page view credits one Google visit with every page the reader then
// clicks. Only the first page view of a session carries the referrer and the
// campaign tags (ChatGPT and others append utm_source to links they cite).
function landingContext() {
  try {
    if (sessionStorage.getItem(LANDING_KEY)) return null;
    sessionStorage.setItem(LANDING_KEY, '1');
  } catch {
    // Storage blocked: fall through and report this view as a landing.
  }
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach((key) => {
    const value = params.get(key);
    if (value) utm[key] = value.slice(0, 100);
  });
  return { referrer: document.referrer || null, utm };
}

export async function trackEvent(eventType, metadata = {}) {
  if (!supabase) return;

  const landing = eventType === 'page_view' ? landingContext() : null;
  const { error } = await supabase.from('analytics_events').insert({
    event_type: eventType,
    page_path: window.location.pathname,
    referrer: landing ? landing.referrer : null,
    user_agent: navigator.userAgent,
    metadata: {
      ...metadata,
      session: sessionId(),
      ...(landing ? { landing: true, ...landing.utm } : {}),
    },
  });
  // Analytics must never break the page; surface failures in dev only.
  if (error && import.meta.env.DEV) console.warn('trackEvent failed:', error.message);
}
