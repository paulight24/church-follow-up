/**
 * The event's narrative, collapsed, below the form.
 *
 * Feedback from a real event (Pastor Stephen, Encounter Oct 2026): the page
 * opened with several paragraphs of invitation copy, so a visitor who had
 * already decided — they scanned a QR code off a flier they were holding —
 * had to scroll past the pitch to reach the first field. The flier had done
 * the persuading; the page's job was to take the registration.
 *
 * So the hero keeps what a scanner needs to trust the page (flier, event
 * name, date, venue, countdown), the form comes straight after it, and the
 * prose moves down here behind one collapsed row. Native <details> rather
 * than a state hook: it is keyboard- and screen-reader-correct for free, it
 * survives a re-render, and it still works if the page's JS is slow to boot.
 */
import { ChevronDown, Info } from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import { useTranslation } from '@/i18n';

export function EventDetailsDisclosure({ description }: { description: string }) {
  const { t } = useTranslation();

  return (
    <details className="group mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
      <summary
        className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
      >
        <Info className="h-4 w-4 shrink-0 text-indigo-600" />
        <span className="flex-1">{t('event.detailsToggle')}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div
        className="prose prose-sm max-w-none border-t border-slate-100 px-5 pb-5 pt-4 text-slate-700 [&_a]:text-indigo-600 [&_img]:rounded-lg [&_p+p]:mt-3 [&_p]:leading-relaxed"
        // Admin-authored HTML on a page anyone on the internet can load — same
        // sanitizer as every other render site. See src/lib/sanitizeHtml.ts.
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
      />
    </details>
  );
}
