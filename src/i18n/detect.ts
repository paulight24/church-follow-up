import { LOCALES, type Locale } from './types';

export const LOCALE_STORAGE_KEY = 'publicLocale';

function normalise(tag: string): Locale | null {
  const lower = tag.toLowerCase();
  // Match the base subtag: es-US, es-419 and es all resolve to 'es';
  // zh-CN, zh-Hans and zh-TW all resolve to 'zh'.
  const base = lower.split('-')[0];
  return (LOCALES as readonly string[]).includes(base) ? (base as Locale) : null;
}

/**
 * Resolution order, most explicit first:
 *
 *   1. ?lang= on the URL — lets a church print a Spanish flier whose QR points
 *      at the same event with ?lang=es, without needing a second page.
 *   2. A choice this visitor made before (they overrode us once; respect it).
 *   3. The phone's own language list — the case that matters most, because a
 *      Spanish speaker scanning the ENGLISH flier still gets Spanish.
 *   4. English.
 */
export function detectLocale(search: string = window.location.search): Locale {
  const param = new URLSearchParams(search).get('lang');
  if (param) {
    const forced = normalise(param);
    if (forced) return forced;
  }

  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved) {
      const savedLocale = normalise(saved);
      if (savedLocale) return savedLocale;
    }
  } catch {
    // Private browsing can throw on storage access — fall through to the
    // browser languages rather than failing to render the page at all.
  }

  for (const tag of navigator.languages ?? [navigator.language]) {
    const match = normalise(tag);
    if (match) return match;
  }
  return 'en';
}

export function rememberLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Non-fatal: the choice just won't survive a reload.
  }
}
