import { Check, ChevronDown, Globe } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Dropdown } from '@/components/ui/Dropdown';
import { useTranslation } from './useTranslation';
import { LOCALES, LOCALE_LABELS } from './types';

/**
 * Language switcher.
 *
 * Collapsed to a single globe + 2-character trigger rather than a row of
 * buttons: language is a once-per-visitor decision, and a permanent row of
 * every language competes for header space with the actions people actually
 * came to take — enough to wrap the nav onto two lines on a tablet.
 *
 * The menu lists each language in ITS OWN language, never translated into the
 * current one. Someone who cannot read this page has to be able to find their
 * way out of it, and "Chinese" is useless to a reader who only reads 中文.
 *
 * Built on the shared Dropdown primitive so click-outside, Escape and the
 * menu/menuitem roles behave exactly like every other menu in the product.
 */
export function LanguageSwitcher({
  className,
  variant = 'compact',
}: {
  className?: string;
  /** `compact` for headers (globe + code); `full` for footers (globe + name). */
  variant?: 'compact' | 'full';
}) {
  const { locale, setLocale } = useTranslation();
  const current = LOCALE_LABELS[locale];

  return (
    <Dropdown
      className={className}
      align="right"
      items={LOCALES.map((code) => {
        const label = LOCALE_LABELS[code];
        const isCurrent = code === locale;
        return {
          label: label.native === label.english ? label.native : `${label.native} · ${label.english}`,
          onClick: () => setLocale(code),
          icon: isCurrent ? (
            <Check className="h-4 w-4 text-indigo-600" />
          ) : (
            <span className="inline-block h-4 w-4" aria-hidden />
          ),
        };
      })}
      trigger={
        <span
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900',
            className
          )}
          // The control is the language chooser regardless of which language
          // is showing, so the accessible name stays stable and untranslated.
          aria-label={`Language: ${current.english}`}
        >
          <Globe className="h-4 w-4 shrink-0" aria-hidden />
          <span className="whitespace-nowrap">
            {variant === 'full' ? current.native : current.short}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
        </span>
      }
    />
  );
}
