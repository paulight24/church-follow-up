import type en from './locales/en';

/**
 * Locales the PUBLIC pages are translated into. This is deliberately not the
 * same list as the Live Translation language catalog: that one is what a
 * sermon can be interpreted into (16+ languages, provider-driven), this one
 * is what we have human-quality UI copy for. Adding a locale here means
 * writing a full dictionary and shipping another lazy chunk.
 */
export const LOCALES = ['en', 'es', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];

/** `short` is the collapsed trigger label — kept to 2 characters so the
 *  switcher never widens the header enough to wrap the nav. */
export const LOCALE_LABELS: Record<
  Locale,
  { native: string; english: string; short: string; flag: string }
> = {
  en: { native: 'English', english: 'English', short: 'EN', flag: '🇺🇸' },
  es: { native: 'Español', english: 'Spanish', short: 'ES', flag: '🇪🇸' },
  zh: { native: '中文', english: 'Chinese', short: '中文', flag: '🇨🇳' },
};

/**
 * English is the source of truth: every other dictionary is typed against it,
 * so adding a key to en.ts without translating it is a build error rather
 * than a string that silently renders in the wrong language at church.
 *
 * Values are widened to `string` deliberately — en.ts is `as const` so its
 * values are literal types, and mapping over the keys is what keeps
 * "every key present" checked without also demanding the English wording.
 */
export type TranslationKey = keyof typeof en;
export type Translations = Record<TranslationKey, string>;

/** Values substituted into `{placeholder}` slots. */
export type TranslationVars = Record<string, string | number>;
