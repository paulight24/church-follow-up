/**
 * Deciding on submissions to an event where submitting is a request rather
 * than a place — the Open Mic talent form.
 *
 * The screen is built around the question a reviewer actually has open in
 * front of them: *what still needs a decision, and what have we promised
 * people?* So it opens on the undecided ones, shows each person's own words
 * next to the controls rather than behind a click, and keeps "have we told
 * them" visible — the failure mode this replaces is not a wrong decision, it
 * is an approved performer who never heard back.
 */
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ClipboardList, Download, ListOrdered, Mail, Send } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { downloadCsv } from '@/lib/downloadCsv';
import { formatDateTime } from '@/lib/formatters';
import { eventsApi } from '../api/events.api';
import type {
  EventRegistration,
  EventRehearsalStatus,
  EventReviewStatus,
  ReviewRegistrationPayload,
} from '@/types/event';

const STATUS_LABELS: Record<EventReviewStatus, string> = {
  NEW: 'New',
  UNDER_REVIEW: 'Under review',
  APPROVED: 'Approved',
  WAITLISTED: 'Waitlisted',
  DECLINED: 'Declined',
};

const STATUS_VARIANT: Record<EventReviewStatus, 'gray' | 'info' | 'success' | 'warning' | 'danger'> = {
  NEW: 'gray',
  UNDER_REVIEW: 'info',
  APPROVED: 'success',
  WAITLISTED: 'warning',
  DECLINED: 'danger',
};

const REHEARSAL_LABELS: Record<EventRehearsalStatus, string> = {
  NOT_NEEDED: 'Not needed',
  TO_ARRANGE: 'To arrange',
  SCHEDULED: 'Scheduled',
  DONE: 'Done',
};

type Filter = 'undecided' | 'approved' | 'all';

/** The registrant's own answers, in the order the form asked them. */
function answerLines(registration: EventRegistration): Array<[string, string]> {
  const custom = registration.answers.custom ?? {};
  return Object.entries(custom)
    .filter(([, value]) => value?.trim())
    .map(([key, value]) => [key.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()), value]);
}

function RegistrationCard({
  eventId,
  registration,
}: {
  eventId: string;
  registration: EventRegistration;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [notes, setNotes] = useState(registration.review.notes ?? '');
  const [expanded, setExpanded] = useState(false);

  const save = useMutation({
    mutationFn: (data: ReviewRegistrationPayload) =>
      eventsApi.reviewRegistration(eventId, registration.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event-registrations', eventId] }),
    onError: () => toast({ title: 'Could not save that', variant: 'error' }),
  });

  const review = registration.review;
  const name = registration.member
    ? `${registration.member.firstName} ${registration.member.lastName}`.trim()
    : [registration.answers.firstName, registration.answers.lastName].filter(Boolean).join(' ') || 'Someone';
  const lines = answerLines(registration);

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900">{name}</span>
            <Badge variant={STATUS_VARIANT[review.status]}>{STATUS_LABELS[review.status]}</Badge>
            {review.runningOrder != null && (
              <Badge variant="purple">
                <ListOrdered className="mr-1 inline h-3 w-3" />#{review.runningOrder}
              </Badge>
            )}
            {review.status === 'APPROVED' && !review.decisionSentAt && (
              // The failure this panel exists to prevent.
              <Badge variant="warning">Not told yet</Badge>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-slate-500">
            {registration.member?.email && (
              <a href={`mailto:${registration.member.email}`} className="text-indigo-600">
                {registration.member.email}
              </a>
            )}
            {registration.member?.phonePrimary && (
              <a href={`tel:${registration.member.phonePrimary}`} className="text-indigo-600">
                {registration.member.phonePrimary}
              </a>
            )}
            <span className="text-xs text-slate-400">{formatDateTime(registration.submittedAt)}</span>
          </div>
        </div>
      </div>

      {lines.length > 0 && (
        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
          <ul className="space-y-1">
            {(expanded ? lines : lines.slice(0, 4)).map(([label, value]) => (
              <li key={label} className="flex gap-2">
                <span className="shrink-0 text-slate-500">{label}:</span>
                <span className="min-w-0 text-slate-800">{value}</span>
              </li>
            ))}
          </ul>
          {lines.length > 4 && (
            <button
              type="button"
              className="mt-1.5 text-xs font-medium text-indigo-600"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? 'Show less' : `Show all ${lines.length} answers`}
            </button>
          )}
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Select
          label="Decision"
          value={review.status}
          disabled={save.isPending}
          options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          onChange={(e) => save.mutate({ reviewStatus: e.target.value as EventReviewStatus })}
        />
        <Input
          label="Minutes"
          type="number"
          placeholder="5"
          defaultValue={review.approvedDurationMinutes ?? ''}
          disabled={save.isPending}
          onBlur={(e) =>
            save.mutate({ approvedDurationMinutes: e.target.value ? Number(e.target.value) : null })
          }
        />
        <Input
          label="Order"
          type="number"
          placeholder="1"
          defaultValue={review.runningOrder ?? ''}
          disabled={save.isPending}
          onBlur={(e) => save.mutate({ runningOrder: e.target.value ? Number(e.target.value) : null })}
        />
        <Select
          label="Rehearsal"
          value={review.rehearsalStatus ?? ''}
          disabled={save.isPending}
          options={[
            { value: '', label: '—' },
            ...Object.entries(REHEARSAL_LABELS).map(([value, label]) => ({ value, label })),
          ]}
          onChange={(e) =>
            save.mutate({ rehearsalStatus: (e.target.value || null) as EventRehearsalStatus | null })
          }
        />
      </div>

      <div className="mt-3">
        <Textarea
          label="Internal notes"
          rows={2}
          placeholder="Only the review team sees this."
          value={notes}
          disabled={save.isPending}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => notes !== (review.notes ?? '') && save.mutate({ reviewNotes: notes || null })}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-slate-400">
          {review.reviewerName ? `Reviewed by ${review.reviewerName}` : 'No reviewer recorded'}
          {review.reviewedAt && ` · ${formatDateTime(review.reviewedAt)}`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          isLoading={save.isPending}
          leftIcon={
            review.decisionSentAt ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />
          }
          onClick={() => save.mutate({ decisionSent: !review.decisionSentAt })}
        >
          {review.decisionSentAt ? 'Told them' : 'Mark as told'}
        </Button>
      </div>
    </li>
  );
}

export function RegistrationReviewPanel({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [filter, setFilter] = useState<Filter>('undecided');
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['event-registrations', eventId],
    // One page big enough to review in one sitting; an Open Mic segment that
    // exceeds this has a bigger problem than pagination.
    queryFn: () => eventsApi.getRegistrations(eventId, { page: 1, pageSize: 200 }).then((res) => res.data),
  });

  const registrations = data?.data ?? [];
  const visible = useMemo(() => {
    if (filter === 'all') return registrations;
    if (filter === 'approved') return registrations.filter((r) => r.review.status === 'APPROVED');
    return registrations.filter((r) => r.review.status === 'NEW' || r.review.status === 'UNDER_REVIEW');
  }, [registrations, filter]);

  const undecided = registrations.filter(
    (r) => r.review.status === 'NEW' || r.review.status === 'UNDER_REVIEW'
  ).length;
  const untold = registrations.filter(
    (r) => r.review.status === 'APPROVED' && !r.review.decisionSentAt
  ).length;

  async function handleExport() {
    setIsExporting(true);
    try {
      const res = await eventsApi.exportRegistrations(eventId);
      downloadCsv(
        `${eventName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-submissions.csv`,
        res.data.map((row) => ({
          'First Name': row.firstName,
          'Last Name': row.lastName,
          Email: row.email,
          Phone: row.phone,
          Decision: row.reviewStatus,
          Reviewer: row.reviewer,
          'Approved Minutes': row.approvedDurationMinutes,
          'Running Order': row.runningOrder,
          Rehearsal: row.rehearsalStatus,
          'Told At': row.decisionSentAt,
          'Submitted At': row.submittedAt,
        }))
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <ClipboardList className="h-4 w-4 text-indigo-600" />
          Submissions to review
          {undecided > 0 && <Badge variant="warning">{undecided} undecided</Badge>}
          {untold > 0 && (
            <Badge variant="danger">
              <Mail className="mr-1 inline h-3 w-3" />
              {untold} approved, not told
            </Badge>
          )}
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            className="w-44"
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            options={[
              { value: 'undecided', label: 'Needs a decision' },
              { value: 'approved', label: 'Approved' },
              { value: 'all', label: 'Everything' },
            ]}
          />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            isLoading={isExporting}
            disabled={registrations.length === 0}
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
          <p className="py-12 text-center text-sm text-rose-600">Could not load submissions.</p>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={filter === 'undecided' ? 'Nothing waiting on a decision' : 'Nothing here yet'}
            description={
              filter === 'undecided'
                ? 'Every submission has been decided. Switch to Everything to see them all.'
                : 'Submissions appear here as people send the form.'
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((registration) => (
              <RegistrationCard key={registration.id} eventId={eventId} registration={registration} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
