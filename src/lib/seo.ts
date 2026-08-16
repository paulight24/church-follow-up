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

export interface SeoOptions {
  title: string;
  description: string;
  /** Path only, e.g. "/register-church". Omit for the current location. */
  path?: string;
  /** Keep private/QR-reached pages out of search results. */
  noIndex?: boolean;
  image?: string;
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

export function useSeo({ title, description, path, noIndex, image }: SeoOptions): void {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const url = `${SITE_URL}${path ?? window.location.pathname}`;
    const ogImage = image ?? `${SITE_URL}/og-image.svg`;

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
  }, [title, description, path, noIndex, image]);
}
