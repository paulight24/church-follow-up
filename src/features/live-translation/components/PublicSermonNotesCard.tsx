/**
 * Sermon notes as a member reads them, on the public listener page (spec §20).
 *
 * Reachable only through the church's opaque service code, and only once the
 * church deliberately published them: an unpublished set resolves to null and
 * this component renders nothing at all. Nothing here is ever fetched while a
 * service is live — it appears after, on the same link people already have.
 */
import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { Spinner } from '@/components/ui/Spinner';
import { getPublicSermonNotes } from '../api/liveTranslation.api';

export function PublicSermonNotesCard({ code, preferredLocale }: { code: string; preferredLocale?: string }) {
  const { t } = useTranslation();

  const notesQuery = useQuery({
    queryKey: ['public-sermon-notes', code, preferredLocale ?? ''],
    queryFn: () => getPublicSermonNotes(code, preferredLocale),
    // These change only when a church republishes; a phone left open on the
    // page should not poll a public endpoint.
    staleTime: 5 * 60_000,
    retry: false,
  });

  if (notesQuery.isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner className="text-indigo-600" />
      </div>
    );
  }

  const payload = notesQuery.data;
  if (!payload) return null;

  const { notes } = payload;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
        <BookOpen className="h-3.5 w-3.5" />
        {t('notes.heading')}
      </p>

      <h2 className="mt-2 text-xl font-bold leading-snug text-slate-900">{notes.title}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{notes.summary}</p>

      <Section heading={t('notes.keyPoints')} items={notes.keyPoints} />
      <Section heading={t('notes.scriptures')} items={notes.scriptures} />
      <Section heading={t('notes.declarations')} items={notes.declarations} />
      <Section heading={t('notes.prayerPoints')} items={notes.prayerPoints} />
      <Section heading={t('notes.actionPoints')} items={notes.actionPoints} />

      <p className="mt-5 border-t border-slate-100 pt-3 text-xs text-slate-400">{t('notes.disclaimer')}</p>
    </section>
  );
}

function Section({ heading, items }: { heading: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{heading}</h3>
      <ul className="mt-2 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-700">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
