/**
 * What came back from the page.
 *
 * Sorted newest-first, not "unhandled first": burying a prayer request that
 * arrived an hour ago under twenty older ones somebody already dealt with is
 * how a list stops being read. The filter does that job instead, and defaults
 * to the two things that need a person — a contact request or a prayer
 * request.
 */
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Download, Inbox, Mail, MessageSquareHeart, Phone, Trash2, Undo2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { downloadCsv } from '@/lib/downloadCsv';
import { formatDateTime } from '@/lib/formatters';
import { resourcesApi } from '../api/resources.api';

const INTEREST_LABELS: Record<string, string> = {
  RECEIVE_CHRIST: 'Wants to receive Christ',
  LEARN_MORE: 'Wants to learn more',
  JOIN_CHURCH: 'Interested in joining',
  CELL_GROUP: 'Interested in a cell group',
};

const LOCALE_LABELS: Record<string, string> = { en: 'English', es: 'Spanish', zh: 'Chinese' };

type Filter = 'needsAction' | 'all' | 'handled';

export function ResourceResponsesPanel({ pageId, pageTitle }: { pageId: string; pageTitle: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('needsAction');
  const [isExporting, setIsExporting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { data: responses, isLoading, isError } = useQuery({
    queryKey: ['resource-responses', pageId],
    queryFn: () => resourcesApi.listResponses(pageId).then((res) => res.data),
  });

  const markHandled = useMutation({
    mutationFn: ({ id, handled }: { id: string; handled: boolean }) =>
      resourcesApi.markResponseHandled(pageId, id, handled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resource-responses', pageId] }),
    onError: () => toast({ title: 'Could not update that response', variant: 'error' }),
  });

  const remove = useMutation({
    mutationFn: (responseId: string) => resourcesApi.deleteResponse(pageId, responseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-responses', pageId] });
      toast({ title: 'Response deleted', variant: 'success' });
    },
    onError: () => toast({ title: 'Could not delete that response', variant: 'error' }),
  });

  const visible = useMemo(() => {
    const all = responses ?? [];
    if (filter === 'all') return all;
    if (filter === 'handled') return all.filter((r) => r.handledAt);
    return all.filter((r) => !r.handledAt && (r.wantsContact || r.prayerRequest));
  }, [responses, filter]);

  async function handleExport() {
    setIsExporting(true);
    try {
      const res = await resourcesApi.exportResponses(pageId);
      downloadCsv(
        `${pageTitle.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-responses.csv`,
        res.data.map((row) => ({
          'Received At': row.receivedAt,
          'First Name': row.firstName,
          'Last Name': row.lastName,
          Email: row.email,
          Phone: row.phone,
          'Wants Contact': row.wantsContact,
          Interests: row.interests,
          'Prayer Request': row.prayerRequest,
          Language: row.language,
          'Member ID': row.memberId,
        }))
      );
    } finally {
      setIsExporting(false);
    }
  }

  const needsAction = (responses ?? []).filter(
    (r) => !r.handledAt && (r.wantsContact || r.prayerRequest)
  ).length;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Inbox className="h-4 w-4 text-indigo-600" />
          Responses
          {needsAction > 0 && <Badge variant="warning">{needsAction} need someone</Badge>}
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            className="w-48"
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            options={[
              { value: 'needsAction', label: 'Needs someone' },
              { value: 'all', label: 'Everything' },
              { value: 'handled', label: 'Followed up' },
            ]}
          />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            isLoading={isExporting}
            disabled={!responses || responses.length === 0}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : isError ? (
          <p className="py-12 text-center text-sm text-rose-600">Could not load responses.</p>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={filter === 'needsAction' ? 'Nobody is waiting' : 'Nothing here yet'}
            description={
              filter === 'needsAction'
                ? 'Every contact request and prayer request on this page has been followed up.'
                : 'Responses appear here when someone fills in the card at the bottom of the page.'
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((response) => (
              <li key={response.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {response.firstName} {response.lastName ?? ''}
                      </span>
                      {response.wantsContact && <Badge variant="warning">Asked to be contacted</Badge>}
                      {response.handledAt && <Badge variant="success">Followed up</Badge>}
                      {response.locale && response.locale !== 'en' && (
                        <Badge variant="gray">{LOCALE_LABELS[response.locale] ?? response.locale}</Badge>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                      {response.email && (
                        <a href={`mailto:${response.email}`} className="flex items-center gap-1.5 text-indigo-600">
                          <Mail className="h-3.5 w-3.5" />
                          {response.email}
                        </a>
                      )}
                      {response.phone && (
                        <a href={`tel:${response.phone}`} className="flex items-center gap-1.5 text-indigo-600">
                          <Phone className="h-3.5 w-3.5" />
                          {response.phone}
                        </a>
                      )}
                      <span className="text-xs text-slate-400">{formatDateTime(response.createdAt)}</span>
                    </div>

                    {response.interests.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {response.interests.map((interest) => (
                          <li
                            key={interest}
                            className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                          >
                            {INTEREST_LABELS[interest] ?? interest}
                          </li>
                        ))}
                      </ul>
                    )}

                    {response.prayerRequest && (
                      <div className="mt-2 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <MessageSquareHeart className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <span>{response.prayerRequest}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={
                        response.handledAt ? <Undo2 className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />
                      }
                      isLoading={markHandled.isPending && markHandled.variables?.id === response.id}
                      onClick={() =>
                        markHandled.mutate({ id: response.id, handled: !response.handledAt })
                      }
                    >
                      {response.handledAt ? 'Reopen' : 'Followed up'}
                    </Button>
                    <button
                      type="button"
                      aria-label="Delete this response"
                      className="rounded p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => setPendingDelete(response.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) remove.mutate(pendingDelete);
          setPendingDelete(null);
        }}
        title="Delete this response?"
        // Said plainly because the two are easy to confuse, and someone
        // clearing spam should not fear deleting a person by accident.
        message="The message is removed for good. The member record and any prayer request it raised are kept."
        confirmText="Delete"
        variant="danger"
      />
    </Card>
  );
}
