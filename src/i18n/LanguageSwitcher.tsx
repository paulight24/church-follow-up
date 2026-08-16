import { Globe } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTranslation } from './useTranslation';
import { LOCALES, LOCALE_LABELS } from './types';

/**
 * Language override for the public pages. Auto-detection is right most of the
 * time, but a shared family phone set to English carried by a Spanish speaker
 * is common enough that the escape hatch has to be visible — and it has to
 * read in the language being switched TO, so someone who cannot read the
 * current page can still find their way out of it.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslation();

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Globe className="h-3.5 w-3.5 text-slate-400" aria-hidden />
      <div className="flex items-center gap-0.5" role="group" aria-label="Language">
        {LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-current={locale === code ? 'true' : undefined}
            lang={code}
            className={cn(
              'rounded-md px-2 py-1 text-xs font-medium transition-colors',
              locale === code
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            )}
          >
            {LOCALE_LABELS[code].native}
          </button>
        ))}
      </div>
    </div>
  );
}
