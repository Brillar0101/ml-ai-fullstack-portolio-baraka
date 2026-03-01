import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../lib/trackEvent';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Don't track admin pages
    if (location.pathname.startsWith('/admin')) return;

    trackEvent('page_view', {
      path: location.pathname
    });
  }, [location.pathname]);
}
