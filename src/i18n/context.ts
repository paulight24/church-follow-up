import { createContext } from 'react';
import type { Locale, TranslationKey, TranslationVars } from './types';

/** Kept out of I18nProvider.tsx so that file exports only components —
 *  a module exporting both breaks React Fast Refresh in dev. */
export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: TranslationVars) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
