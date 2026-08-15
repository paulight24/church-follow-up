import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from '@/lib/analytics';

/**
 * Reports one scrubbed page view per route change. Renders nothing, and
 * does nothing at all unless VITE_GA_MEASUREMENT_ID is configured — see
 * lib/analytics.ts for what is deliberately never sent.
 */
export function AnalyticsListener() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname, location.search);
  }, [location.pathname, location.search]);

  return null;
}
