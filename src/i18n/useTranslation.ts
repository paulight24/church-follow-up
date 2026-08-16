import { useContext } from 'react';
import { I18nContext } from './context';
import en from './locales/en';
import type { TranslationKey, TranslationVars } from './types';

/**
 * Public-page translations.
 *
 * Falls back to English outside an I18nProvider instead of throwing: these
 * strings are also reachable from shared components that the signed-in
 * (English-only) app renders, and a missing provider should never be able to
 * blank a page a visitor is standing in a service trying to read.
 */
export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (ctx) return ctx;
  return {
    locale: 'en' as const,
    setLocale: () => undefined,
    t: (key: TranslationKey, vars?: TranslationVars) =>
      vars
        ? en[key].replace(/\{(\w+)\}/g, (m, n: string) => (n in vars ? String(vars[n]) : m))
        : en[key],
  };
}
