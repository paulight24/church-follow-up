import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Copy, RefreshCw, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import { liveTranslationApi } from '../api/liveTranslation.api';

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
  const canGenerate = canGenerateNotes || canManageLiveTranslation;

  const notesQuery = useQuery({
    queryKey: ['live-translation', 'notes', sessionId],
    queryFn: () => liveTranslationApi.getSermonNotes(sessionId).then((r) => r.data),
  });

  const generate = useMutation({
    mutationFn: (regenerate: boolean) =>
      liveTranslationApi.generateSermonNotes(sessionId, regenerate).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['live-translation', 'notes', sessionId], data);
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

  const notes = notesQuery.data ?? null;

  const copyNotes = async () => {
    if (!notes) return;
    const section = (heading: string, items: string[]) =>
      items.length ? `\n${heading}\n${items.map((i) => `• ${i}`).join('\n')}\n` : '';
    const text = [
      notes.title,
      '',
      notes.summary,
      section('Key points', notes.keyPoints),
      section('Scriptures', notes.scriptures),
      section('Declarations', notes.declarations),
      section('Prayer points', notes.prayerPoints),
      section('Action points', notes.actionPoints),
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4 text-indigo-600" />
          Sermon notes
        </CardTitle>
        <div className="flex gap-2">
          {notes && (
            <Button variant="outline" size="sm" leftIcon={<Copy className="h-3.5 w-3.5" />} onClick={copyNotes}>
              Copy
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
            <div>
              <h3 className="text-lg font-bold text-slate-900">{notes.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{notes.summary}</p>
            </div>

            <NoteList heading="Key points" items={notes.keyPoints} />
            <NoteList heading="Scriptures" items={notes.scriptures} />
            <NoteList heading="Declarations" items={notes.declarations} />
            <NoteList heading="Prayer points" items={notes.prayerPoints} />
            <NoteList heading="Action points" items={notes.actionPoints} />

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
