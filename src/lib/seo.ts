/**
 * Per-route SEO metadata for a single-page app.
 *
 * index.html carries the static tags a crawler sees before any JS runs (they
 * describe the landing page). This hook updates title/description/canonical
 * and the social tags when the user — or Googlebot, which does execute JS —
 * navigates to another public route, so each page can rank for its own terms
 * instead of every URL sharing the landing page's snippet.
 *
 * Deliberately dependency-free: react-helmet would be a runtime dependency
 * for what is a dozen lines of DOM writes.
 */
import { useEffect } from 'react';

export const SITE_NAME = 'Member Care';
export const SITE_URL = 'https://churchmembercare.com';

export interface SeoAlternate {
  /** "es", "zh", or "x-default". */
  hreflang: string;
  href: string;
}

export interface SeoOptions {
  title: string;
  description: string;
  /** Path only, e.g. "/register-church". Omit for the current location. */
  path?: string;
  /** Keep private/QR-reached pages out of search results. */
  noIndex?: boolean;
  image?: string;
  /**
   * Language variants of THIS page. Only meaningful on indexable pages that
   * render in more than one language: it tells Google the Spanish and English
   * versions are the same page rather than duplicates competing with each
   * other, and lets it serve the right one per searcher.
   */
  alternates?: SeoAlternate[];
  /**
   * Canonical override. A localised page must self-canonicalise (…/welcome?lang=es
   * points at itself, not at the English original) or the translated variants
   * collapse into the English one and never rank.
   */
  canonical?: string;
}

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Alternates are re-rendered wholesale, so stale variants can't linger when
 *  the visitor navigates from a localised page to a single-language one. */
const ALTERNATE_ATTR = 'data-seo-alternate';

function syncAlternates(alternates: SeoAlternate[]): void {
  document.head
    .querySelectorAll(`link[${ALTERNATE_ATTR}]`)
    .forEach((el) => el.remove());
  for (const { hreflang, href } of alternates) {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = hreflang;
    link.href = href;
    link.setAttribute(ALTERNATE_ATTR, '');
    document.head.appendChild(link);
  }
}

export function useSeo({
  title,
  description,
  path,
  noIndex,
  image,
  alternates,
  canonical,
}: SeoOptions): void {
  // Arrays are usually rebuilt each render; comparing by value keeps the
  // effect from thrashing the <head> on every parent re-render.
  const alternatesKey = alternates ? JSON.stringify(alternates) : '';

  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const url = canonical ?? `${SITE_URL}${path ?? window.location.pathname}`;
    const ogImage = image ?? `${SITE_URL}/og-image.svg`;
    syncAlternates(alternates ?? []);

    document.title = fullTitle;
    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta(
      'meta[name="robots"]',
      'name',
      'robots',
      noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'
    );
    upsertCanonical(url);

    upsertMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', ogImage);
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);
    // alternatesKey stands in for the `alternates` array by value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, path, noIndex, image, canonical, alternatesKey]);
}
