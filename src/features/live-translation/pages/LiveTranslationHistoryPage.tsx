/**
 * Past live services: what happened, what it cost, and what was preached.
 *
 * The transcript is the reason this page exists. The app guide already tells
 * churches the sermon transcript "can be opened afterwards", the backend has
 * stored it since launch, and until now there was nowhere to read it. It is
 * also the groundwork the future Sermon Notes feature reads from, so it is
 * worth surfacing plainly rather than leaving as an API-only artefact.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Copy, FileText, Languages as LanguagesIcon, Radio, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import { cn } from '@/lib/cn';
import { liveTranslationApi, type SessionListItem } from '../api/liveTranslation.api';
import { displayName } from '../lib/languages';
import { SermonNotesCard } from '../components/SermonNotesCard';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatWhen(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

const STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'gray' | 'info' }> = {
  ENDED: { label: 'Completed', variant: 'success' },
  TIMED_OUT: { label: 'Auto-stopped', variant: 'warning' },
  FAILED: { label: 'Interrupted', variant: 'danger' },
  LIVE: { label: 'Live now', variant: 'info' },
  READY: { label: 'Not started', variant: 'gray' },
  ENDING: { label: 'Ending', variant: 'warning' },
};

export function LiveTranslationHistoryPage() {
  const { toast } = useToast();
  const canViewTranscript = usePermission('live_translation.view_transcript');
  const canManage = usePermission('live_translation.manage');
  const [selected, setSelected] = useState<SessionListItem | null>(null);

  const sessionsQuery = useQuery({
    queryKey: ['live-translation', 'sessions'],
    queryFn: () => liveTranslationApi.listSessions(25).then((r) => r.data),
  });

  const usageQuery = useQuery({
    queryKey: ['live-translation', 'usage'],
    queryFn: () => liveTranslationApi.getUsage().then((r) => r.data),
  });

  const summaryQuery = useQuery({
    queryKey: ['live-translation', 'summary', selected?.id],
    queryFn: () => liveTranslationApi.getSummary(selected!.id).then((r) => r.data),
    enabled: !!selected,
  });

  const transcriptQuery = useQuery({
    queryKey: ['live-translation', 'transcript', selected?.id],
    queryFn: () => liveTranslationApi.getTranscript(selected!.id).then((r) => r.data),
    enabled: !!selected && (canViewTranscript || canManage),
  });

  const sessions = sessionsQuery.data ?? [];
  const usage = usageQuery.data;
  const transcript = transcriptQuery.data ?? [];

  const copyTranscript = async () => {
    const text = transcript.map((s) => s.sourceText).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Transcript copied', variant: 'success' });
    } catch {
      toast({ title: 'Could not copy — select the text instead', variant: 'error' });
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Radio className="h-6 w-6 text-indigo-600" />
          Past live services
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          What was translated, how many people listened, and what was preached.
        </p>
      </div>

      {/* Usage — the billing-relevant number, stated in the terms churches think in. */}
      {usage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-slate-500">Services translated</dt>
                <dd className="text-2xl font-bold text-slate-900">{usage.sessions}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Translation minutes</dt>
                <dd className="text-2xl font-bold text-slate-900">{usage.totalMinutes}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Languages used</dt>
                <dd className="text-2xl font-bold text-slate-900">
                  {Object.keys(usage.byLanguage).length}
                </dd>
              </div>
            </dl>
            {Object.keys(usage.byLanguage).length > 0 && (
              <p className="mt-3 text-xs text-slate-500">
                {Object.entries(usage.byLanguage)
                  .sort((a, b) => b[1] - a[1])
                  .map(([code, secs]) => `${displayName(code)}: ${Math.round(secs / 60)} min`)
                  .join(' · ')}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-400">
              Translation minutes count each language once, however many people listened to it.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Session list */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Services</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {sessionsQuery.isLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner className="text-indigo-600" />
                </div>
              ) : sessions.length === 0 ? (
                <EmptyState
                  icon={Radio}
                  title="No services yet"
                  description="Once you run a live translation, it will appear here."
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {sessions.map((s) => {
                    const badge = STATUS_BADGE[s.status] ?? { label: s.status, variant: 'gray' as const };
                    const isSelected = selected?.id === s.id;
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => setSelected(s)}
                          aria-current={isSelected ? 'true' : undefined}
                          className={cn(
                            'w-full px-4 py-3 text-left transition-colors',
                            isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'
                          )}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-medium text-slate-900">{s.title}</span>
                            <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-500">
                            {formatWhen(s.startedAt ?? s.createdAt)}
                            {s.peakListeners > 0 && ` · ${s.peakListeners} listening at peak`}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detail */}
        <div className="space-y-6 lg:col-span-3">
          {!selected ? (
            <Card>
              <CardContent className="py-16 text-center text-sm text-slate-400">
                Choose a service to see its details and transcript.
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{selected.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {summaryQuery.isLoading ? (
                    <div className="flex justify-center py-6"><Spinner className="text-indigo-600" /></div>
                  ) : summaryQuery.data ? (
                    <>
                      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                          <dt className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="h-3 w-3" /> Duration
                          </dt>
                          <dd className="text-lg font-semibold text-slate-900">
                            {formatDuration(summaryQuery.data.durationSeconds)}
                          </dd>
                        </div>
                        <div>
                          <dt className="flex items-center gap-1 text-xs text-slate-500">
                            <LanguagesIcon className="h-3 w-3" /> Languages
                          </dt>
                          <dd className="text-lg font-semibold text-slate-900">
                            {summaryQuery.data.languagesUsed.length}
                          </dd>
                        </div>
                        <div>
                          <dt className="flex items-center gap-1 text-xs text-slate-500">
                            <Users className="h-3 w-3" /> Peak listeners
                          </dt>
                          <dd className="text-lg font-semibold text-slate-900">
                            {summaryQuery.data.peakListeners}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-500">Translation minutes</dt>
                          <dd className="text-lg font-semibold text-slate-900">
                            {Math.round(summaryQuery.data.translationSeconds / 60)}
                          </dd>
                        </div>
                      </dl>
                      {summaryQuery.data.perLanguage.length > 0 && (
                        <p className="mt-3 text-xs text-slate-500">
                          {summaryQuery.data.perLanguage
                            .map((l) => `${displayName(l.targetLanguage)}: ${Math.round(l.activeSeconds / 60)} min`)
                            .join(' · ')}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">Could not load this service&apos;s summary.</p>
                  )}
                </CardContent>
              </Card>

              {/* Notes above the raw transcript: the notes are what most
                  people came for; the transcript is the source they check. */}
              <SermonNotesCard sessionId={selected.id} hasTranscript={transcript.length > 0} />

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Sermon transcript
                  </CardTitle>
                  {transcript.length > 0 && (
                    <Button variant="outline" size="sm" leftIcon={<Copy className="h-3.5 w-3.5" />} onClick={copyTranscript}>
                      Copy
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {!canViewTranscript && !canManage ? (
                    <p className="text-sm text-slate-500">
                      You do not have permission to read sermon transcripts.
                    </p>
                  ) : transcriptQuery.isLoading ? (
                    <div className="flex justify-center py-6"><Spinner className="text-indigo-600" /></div>
                  ) : transcript.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No transcript was saved for this service. Transcripts are only kept when
                      &ldquo;Save sermon transcript&rdquo; is switched on in Live Translation settings.
                    </p>
                  ) : (
                    <div className="max-h-[28rem] space-y-2 overflow-y-auto rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                      {transcript.map((seg) => (
                        <p key={seg.sequence}>{seg.sourceText}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
