/**
 * Google Analytics 4, on a strict leash.
 *
 * This app's URLs contain real people: /members/<uuid>, /prayer-requests/<id>.
 * Sending those to a third party would export the congregation's structure
 * one path at a time, so every path is scrubbed to its shape
 * (/members/:id) before it leaves the browser, and nothing else — no member
 * names, no emails, no church identifiers, no user id — is ever attached to
 * an event.
 *
 * Disabled unless VITE_GA_MEASUREMENT_ID is set, so local development and
 * any self-hosting church send nothing at all by default.
 */

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const analyticsEnabled = Boolean(MEASUREMENT_ID);

/**
 * Replaces every identifier-looking segment with `:id`. UUIDs, cuids and
 * long numeric ids all collapse, so `/members/8f1c…/notes` reports as
 * `/members/:id/notes` — useful for "which screens get used", useless for
 * identifying anybody.
 */
export function scrubPath(pathname: string): string {
  return pathname
    .split('/')
    .map((segment) => {
      if (!segment) return segment;
      const looksLikeId =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) ||
        /^c[a-z0-9]{20,}$/i.test(segment) ||
        /^\d{4,}$/.test(segment) ||
        /^[0-9a-f]{24,}$/i.test(segment);
      return looksLikeId ? ':id' : segment;
    })
    .join('/');
}

let initialised = false;

export function initAnalytics(): void {
  if (!MEASUREMENT_ID || initialised || typeof document === 'undefined') return;
  initialised = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  // Must push the `arguments` object itself, not a rest-parameter array.
  // gtag.js only processes entries that arrive as `arguments`; a plain array
  // is accepted by dataLayer.push and then silently ignored, so every hit
  // looks fine client-side and nothing ever reaches Google. Hence the
  // function expression rather than an arrow.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    // Page views are sent manually below, after scrubbing — the automatic
    // one would report the raw URL including member ids.
    send_page_view: false,
  });
}

export function trackPageView(pathname: string, search = ''): void {
  if (!MEASUREMENT_ID || !window.gtag) return;
  // The query string is dropped entirely rather than scrubbed: invite and
  // reset tokens live there.
  void search;
  window.gtag('event', 'page_view', {
    page_path: scrubPath(pathname),
    page_location: `${window.location.origin}${scrubPath(pathname)}`,
    page_title: document.title,
  });
}

/**
 * Product events (an export downloaded, a campaign sent). Names only —
 * never pass member data, church names or free text through here.
 */
export function trackEvent(name: string, params: Record<string, string | number | boolean> = {}): void {
  if (!MEASUREMENT_ID || !window.gtag) return;
  window.gtag('event', name, params);
}
