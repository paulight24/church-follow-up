import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import en from './locales/en';
import { detectLocale, rememberLocale } from './detect';
import { I18nContext, type I18nContextValue } from './context';
import type { Locale, TranslationKey, TranslationVars, Translations } from './types';

/**
 * Public-page localisation.
 *
 * Scope is deliberate: this wraps the PUBLIC routes only (listener page,
 * event registration). The signed-in application is English-only, and
 * pretending otherwise — by translating half its screens, or by stamping
 * lang="es" on an English admin UI — would be worse than not translating it.
 *
 * Cost model: English ships inside the main bundle, so the common case has no
 * extra request and no loading flash. Spanish and Chinese are dynamic imports,
 * which Vite emits as their own small chunks and only fetches for the visitor
 * who actually needs one. Until that chunk resolves the page renders English
 * rather than blocking — a service is starting; a spinner would be worse than
 * a beat of English.
 */

const loaders: Record<Exclude<Locale, 'en'>, () => Promise<{ default: Translations }>> = {
  es: () => import('./locales/es'),
  zh: () => import('./locales/zh'),
};

/** Replaces `{placeholder}` slots. Unknown placeholders are left intact so a
 *  copy mistake is visible in review rather than silently blanked. */
function interpolate(template: string, vars?: TranslationVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}

interface I18nProviderProps {
  children?: ReactNode;
  /** Test seam: skip detection and pin a locale. */
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale ?? detectLocale());
  const [dict, setDict] = useState<Translations>(en);

  // A ?lang= arrival is an explicit choice — it came off a Spanish flier —
  // so persist it. Client-side navigation drops the query string, and
  // without this a refresh on the very next page would fall back to the
  // phone's language and undo what the flier asked for.
  useEffect(() => {
    if (initialLocale) return;
    if (new URLSearchParams(window.location.search).has('lang')) {
      rememberLocale(locale);
    }
    // Mount only: later changes come through setLocale, which already persists.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (locale === 'en') {
      setDict(en);
      document.documentElement.lang = 'en';
      return;
    }

    void loaders[locale]()
      .then((mod) => {
        if (cancelled) return;
        setDict(mod.default);
        document.documentElement.lang = locale;
      })
      .catch(() => {
        // A failed chunk (offline, bad deploy) must not blank the page —
        // English is already rendered and stays.
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  // Restore the document language when leaving the public pages, so the
  // English-only application isn't left labelled as Spanish.
  useEffect(() => {
    return () => {
      document.documentElement.lang = 'en';
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    rememberLocale(next);
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: TranslationVars) => interpolate(dict[key] ?? en[key], vars),
    [dict]
  );

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <I18nContext.Provider value={value}>{children ?? <Outlet />}</I18nContext.Provider>
  );
}
