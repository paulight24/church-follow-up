import { LOCALES, type Locale } from './types';

export const LOCALE_STORAGE_KEY = 'publicLocale';

/**
 * What people actually write when they mean a language, beyond the BCP-47 tag.
 *
 * This exists because the parameter goes on printed material. A flier that
 * went out with `?l=ch` and quietly served English is not a bug anyone would
 * notice until the QR codes were already in people's hands, so the parser is
 * generous on the way in rather than strict about a standard nobody consults
 * before sending a link on WhatsApp.
 */
const ALIASES: Record<string, Locale> = {
  spa: 'es', esp: 'es', spanish: 'es', espanol: 'es', 'español': 'es',
  ch: 'zh', cn: 'zh', zho: 'zh', chi: 'zh', chinese: 'zh', mandarin: 'zh',
  eng: 'en', english: 'en',
};

function normalise(tag: string): Locale | null {
  const lower = tag.toLowerCase().trim();
  if (ALIASES[lower]) return ALIASES[lower];
  // Match the base subtag: es-US, es-419 and es all resolve to 'es';
  // zh-CN, zh-Hans and zh-TW all resolve to 'zh'.
  const base = lower.split('-')[0];
  if (ALIASES[base]) return ALIASES[base];
  return (LOCALES as readonly string[]).includes(base) ? (base as Locale) : null;
}

/** Every spelling of the query parameter, plus the bare `?es` form. */
function localeFromSearch(search: string): Locale | null {
  const params = new URLSearchParams(search);
  for (const key of ['lang', 'l', 'locale', 'language']) {
    const value = params.get(key);
    const match = value ? normalise(value) : null;
    if (match) return match;
  }
  // `?es` — no key at all. URLSearchParams reads that as an empty-valued key,
  // which is exactly what someone types when they are shortening a link by
  // hand.
  for (const [key, value] of params.entries()) {
    if (value) continue;
    const match = normalise(key);
    if (match) return match;
  }
  return null;
}

/**
 * Resolution order, most explicit first:
 *
 *   1. The URL — lets a church print a Spanish flier whose QR points at the
 *      same event with ?lang=es, without needing a second page. `?l=`,
 *      `?locale=`, `?language=` and a bare `?es` all work, as do the spellings
 *      in ALIASES, because this ends up on paper.
 *   2. A choice this visitor made before (they overrode us once; respect it).
 *   3. The phone's own language list — the case that matters most, because a
 *      Spanish speaker scanning the ENGLISH flier still gets Spanish.
 *   4. English.
 */
export function detectLocale(search: string = window.location.search): Locale {
  const forced = localeFromSearch(search);
  // A language in the link beats a remembered choice: the person who sent it
  // knows something about the recipient that this device's history does not.
  if (forced) return forced;

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
