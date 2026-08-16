import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Copy, Eye, EyeOff, Languages, RefreshCw, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import { liveTranslationApi, type SermonNoteTranslation } from '../api/liveTranslation.api';
import { languageByCode } from '../lib/languages';

/**
 * Sermon notes for one past service (spec §20).
 *
 * Generation is always a deliberate click, never automatic on page load —
 * every generation spends provider quota, and a church opening its history
 * page should not be billed for browsing. Regeneration asks first for the
 * same reason.
 */
export function SermonNotesCard({ sessionId, hasTranscript }: { sessionId: string; hasTranscript: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Both hooks called unconditionally — `||` would short-circuit the second
  // and vary the hook count with the viewer's permissions.
  const canGenerateNotes = usePermission('live_translation.generate_notes');
  const canManageLiveTranslation = usePermission('live_translation.manage');
  const canConfigure = usePermission('live_translation.configure');
  const canGenerate = canGenerateNotes || canManageLiveTranslation;
  // Publishing puts the notes in front of anyone holding the service link,
  // so it takes the configure grant rather than the generate one.
  const canPublish = canConfigure || canManageLiveTranslation;

  // 'source' is the language it was preached in; anything else is a locale.
  const [viewing, setViewing] = useState('source');

  const notesQuery = useQuery({
    queryKey: ['live-translation', 'notes', sessionId],
    queryFn: () => liveTranslationApi.getSermonNotes(sessionId).then((r) => r.data),
  });

  const translationsQuery = useQuery({
    queryKey: ['live-translation', 'note-translations', sessionId],
    queryFn: () => liveTranslationApi.getSermonNoteTranslations(sessionId).then((r) => r.data),
  });

  const generate = useMutation({
    mutationFn: (regenerate: boolean) =>
      liveTranslationApi.generateSermonNotes(sessionId, regenerate).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['live-translation', 'notes', sessionId], data);
      // Regeneration discards translations of the superseded text on the
      // server; refetch so the tabs match what actually exists, and fall
      // back to the source view since the chosen locale may be gone.
      void queryClient.invalidateQueries({
        queryKey: ['live-translation', 'note-translations', sessionId],
      });
      setViewing('source');
      toast({ title: 'Sermon notes ready', variant: 'success' });
    },
    onError: (err: { response?: { data?: { message?: string; details?: Record<string, string[]> } } }) => {
      const details = err.response?.data?.details;
      const firstDetail = details ? Object.values(details)[0]?.[0] : undefined;
      toast({
        title: firstDetail ?? err.response?.data?.message ?? 'Could not generate notes',
        variant: 'error',
      });
    },
  });

  const translate = useMutation({
    mutationFn: () => liveTranslationApi.translateSermonNotes(sessionId).then((r) => r.data),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['live-translation', 'note-translations', sessionId] });
      // Report honestly: a partial success must not read as a full one.
      const failed = result.failed ?? [];
      if (result.translated.length === 0 && failed.length === 0) {
        toast({ title: 'Already translated into every language this service served', variant: 'success' });
      } else if (failed.length > 0) {
        toast({
          title: `Translated ${result.translated.length}; ${failed.length} failed — try again`,
          variant: 'error',
        });
      } else {
        toast({ title: `Translated into ${result.translated.length} language(s)`, variant: 'success' });
      }
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast({ title: err.response?.data?.message ?? 'Could not translate the notes', variant: 'error' }),
  });

  const publish = useMutation({
    mutationFn: (published: boolean) =>
      liveTranslationApi.publishSermonNotes(sessionId, published).then((r) => r.data),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['live-translation', 'notes', sessionId] });
      toast({
        title: result.published
          ? 'Published — members who open the service link can read these'
          : 'Hidden from members',
        variant: 'success',
      });
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast({ title: err.response?.data?.message ?? 'Could not change publishing', variant: 'error' }),
  });

  const notes = notesQuery.data ?? null;
  const translations = translationsQuery.data ?? [];
  const isPublished = Boolean(notes?.publishedAt);

  // What the reader sees: the source notes, or one translation of them.
  const shown: { title: string; summary: string; keyPoints: string[]; scriptures: string[];
    declarations: string[]; prayerPoints: string[]; actionPoints: string[] } | null =
    viewing === 'source' ? notes : (translations.find((t) => t.locale === viewing) ?? notes);

  const copyNotes = async () => {
    if (!shown) return;
    const section = (heading: string, items: string[]) =>
      items.length ? `\n${heading}\n${items.map((i) => `• ${i}`).join('\n')}\n` : '';
    const text = [
      shown.title,
      '',
      shown.summary,
      section('Key points', shown.keyPoints),
      section('Scriptures', shown.scriptures),
      section('Declarations', shown.declarations),
      section('Prayer points', shown.prayerPoints),
      section('Action points', shown.actionPoints),
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text.trim());
      toast({ title: 'Notes copied', variant: 'success' });
    } catch {
      toast({ title: 'Could not copy — select the text instead', variant: 'error' });
    }
  };

  return (
    <Card>
      {/* Four actions can appear at once (copy / translate / publish /
          regenerate). Stacking below the title on narrow panes keeps the
          heading on one line instead of squeezing it to two words wide. */}
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex shrink-0 items-center gap-2 text-base">
          <BookOpen className="h-4 w-4 text-indigo-600" />
          Sermon notes
        </CardTitle>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {notes && (
            <Button variant="outline" size="sm" leftIcon={<Copy className="h-3.5 w-3.5" />} onClick={copyNotes}>
              Copy
            </Button>
          )}
          {notes && canGenerate && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Languages className="h-3.5 w-3.5" />}
              isLoading={translate.isPending}
              onClick={() => translate.mutate()}
            >
              Translate
            </Button>
          )}
          {notes && canPublish && (
            <Button
              variant={isPublished ? 'outline' : 'primary'}
              size="sm"
              leftIcon={isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              isLoading={publish.isPending}
              onClick={() => publish.mutate(!isPublished)}
            >
              {isPublished ? 'Unpublish' : 'Publish to members'}
            </Button>
          )}
          {canGenerate && hasTranscript && (
            <Button
              variant={notes ? 'outline' : 'primary'}
              size="sm"
              leftIcon={notes ? <RefreshCw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              isLoading={generate.isPending}
              onClick={() => generate.mutate(Boolean(notes))}
            >
              {notes ? 'Regenerate' : 'Generate notes'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notesQuery.isLoading || generate.isPending ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <Spinner className="text-indigo-600" />
            {generate.isPending && (
              <p className="text-sm text-slate-500">Reading the transcript and writing the notes…</p>
            )}
          </div>
        ) : !notes ? (
          <p className="text-sm text-slate-500">
            {!hasTranscript
              ? 'No transcript was saved for this service, so notes cannot be written from it.'
              : canGenerate
                ? 'No notes yet. Generate them from the sermon transcript — this takes a few seconds.'
                : 'No notes have been generated for this service yet.'}
          </p>
        ) : (
          <div className="space-y-5">
            {/* Only shown once a translation exists — a single-language church
                should never see a language chooser with one option in it. */}
            {translations.length > 0 && (
              <LanguageTabs viewing={viewing} onChange={setViewing} translations={translations} />
            )}

            {isPublished && (
              <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                <Eye className="h-3.5 w-3.5 shrink-0" />
                Members who open this service&rsquo;s link can read these notes
                {translations.length > 0 && ' in their own language'}.
              </p>
            )}

            <div>
              <h3 className="text-lg font-bold text-slate-900">{shown!.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{shown!.summary}</p>
            </div>

            <NoteList heading="Key points" items={shown!.keyPoints} />
            <NoteList heading="Scriptures" items={shown!.scriptures} />
            <NoteList heading="Declarations" items={shown!.declarations} />
            <NoteList heading="Prayer points" items={shown!.prayerPoints} />
            <NoteList heading="Action points" items={shown!.actionPoints} />

            {/* Provenance, so a church can tell notes apart when the model
                changes underneath them, and knows these are machine-written. */}
            <p className="border-t border-slate-100 pt-3 text-xs text-slate-400">
              Written automatically from the transcript of this service on{' '}
              {new Date(notes.generatedAt).toLocaleString()}. Read them over before sharing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Source language first, then each translation — native names, because the
 *  person checking the Spanish notes is usually the one who reads Spanish. */
function LanguageTabs({
  viewing,
  onChange,
  translations,
}: {
  viewing: string;
  onChange: (v: string) => void;
  translations: SermonNoteTranslation[];
}) {
  const tabs = [
    { value: 'source', label: 'As preached' },
    ...translations.map((t) => {
      const lang = languageByCode(t.locale);
      return { value: t.locale, label: `${lang.flag} ${lang.nativeName}` };
    }),
  ];
  return (
    <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          aria-pressed={viewing === tab.value}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            viewing === tab.value
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/** Empty sections are hidden rather than shown blank: a service with no
 *  declarations genuinely has none, and an empty heading reads like a bug. */
function NoteList({ heading, items }: { heading: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{heading}</h4>
      <ul className="mt-1.5 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-700">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
