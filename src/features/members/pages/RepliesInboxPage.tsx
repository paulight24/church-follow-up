import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Inbox, Check, Undo2, MessageSquare, UserPlus, Phone } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, formatPhone } from '@/lib/formatters';
import { cn } from '@/lib/cn';
import { repliesApi } from '../api/replies.api';
import type { InboundReply, ReplyIntent, ReplyStatusFilter } from '../api/replies.api';

const PAGE_SIZE = 20;

const FILTERS: Array<{ value: ReplyStatusFilter; label: string }> = [
  { value: 'unhandled', label: 'Needs a person' },
  { value: 'handled', label: 'Dealt with' },
  { value: 'all', label: 'Everything' },
];

/**
 * What the keyword meant, in words a volunteer can act on. STOP is the one
 * that matters most: it has already been honoured automatically, and saying
 * so stops someone "helpfully" adding the number back by hand.
 */
const INTENT_META: Record<ReplyIntent, { label: string; variant: 'danger' | 'success' | 'info' | 'gray'; note?: string }> = {
  STOP: {
    label: 'Opted out',
    variant: 'danger',
    note: 'Already unsubscribed automatically — do not text this number again.',
  },
  START: {
    label: 'Opted back in',
    variant: 'success',
    note: 'Consent restored automatically.',
  },
  HELP: {
    label: 'Asked for help',
    variant: 'info',
    note: 'An automatic reply explaining who we are was sent.',
  },
  OTHER: { label: 'Reply', variant: 'gray' },
};

interface ReplyRowProps {
  reply: InboundReply;
  onToggle: (reply: InboundReply) => void;
  isPending: boolean;
}

function ReplyRow({ reply, onToggle, isPending }: ReplyRowProps) {
  const intent = INTENT_META[reply.intent] ?? INTENT_META.OTHER;
  const handled = Boolean(reply.handledAt);
  const name = reply.member ? `${reply.member.firstName} ${reply.member.lastName}` : null;

  return (
    <Card className={cn(handled && 'opacity-70')}>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar name={name ?? '?'} size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {name ? (
              <Link
                to={`/members/${reply.member!.id}`}
                className="font-medium text-slate-900 hover:text-indigo-600"
              >
                {name}
              </Link>
            ) : (
              <span className="font-medium text-slate-900">{formatPhone(reply.fromNumber)}</span>
            )}
            <Badge variant={intent.variant} size="sm">
              {intent.label}
            </Badge>
            {reply.channel === 'WHATSAPP' && (
              <Badge variant="purple" size="sm">
                WhatsApp
              </Badge>
            )}
            {!reply.member && (
              <Badge variant="warning" size="sm">
                Not on file
              </Badge>
            )}
          </div>

          <p className="mt-2 whitespace-pre-wrap break-words text-slate-700">{reply.body}</p>

          {intent.note && <p className="mt-1.5 text-sm text-slate-500">{intent.note}</p>}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span>{formatDateTime(reply.receivedAt)}</span>
            {name && <span>{formatPhone(reply.fromNumber)}</span>}
            {handled && reply.handledBy && (
              <span>
                Dealt with by {reply.handledBy.firstName} {reply.handledBy.lastName}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!reply.member && (
            <Link to={`/members/new?phone=${encodeURIComponent(reply.fromNumber)}`}>
              <Button variant="outline" size="sm" leftIcon={<UserPlus className="h-4 w-4" />}>
                Add
              </Button>
            </Link>
          )}
          <a href={`tel:${reply.fromNumber}`}>
            <Button variant="outline" size="sm" leftIcon={<Phone className="h-4 w-4" />}>
              Call
            </Button>
          </a>
          <Button
            variant={handled ? 'ghost' : 'primary'}
            size="sm"
            disabled={isPending}
            onClick={() => onToggle(reply)}
            leftIcon={handled ? <Undo2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          >
            {handled ? 'Reopen' : 'Done'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Everything members have texted back.
 *
 * Opt-outs are already honoured by the time they appear here — the point of
 * the screen is that a person sees them, because "Please stop, my husband
 * died" is a pastoral event, not a database flag. Defaults to the unhandled
 * view so the list is a worklist rather than an archive.
 */
export function RepliesInboxPage() {
  const [status, setStatus] = useState<ReplyStatusFilter>('unhandled');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const listQuery = useQuery({
    queryKey: ['members', 'replies', { status, page }],
    queryFn: () => repliesApi.list({ status, page, pageSize: PAGE_SIZE }).then((res) => res.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (reply: InboundReply) => repliesApi.toggleHandled(reply.id),
    onSuccess: (_res, reply) => {
      void queryClient.invalidateQueries({ queryKey: ['members', 'replies'] });
      toast({
        variant: 'success',
        title: reply.handledAt ? 'Reopened' : 'Marked as dealt with',
      });
    },
    onError: () => {
      toast({ variant: 'error', title: 'Could not update that reply' });
    },
  });

  const replies = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;
  const unhandled = listQuery.data?.unhandled ?? 0;

  const changeFilter = (next: ReplyStatusFilter) => {
    setStatus(next);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Replies"
        subtitle="What members have texted back to the church's number."
      />

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => changeFilter(filter.value)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              status === filter.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            {filter.label}
            {filter.value === 'unhandled' && unhandled > 0 && (
              <span
                className={cn(
                  'ml-2 rounded-full px-1.5 py-0.5 text-xs',
                  status === 'unhandled' ? 'bg-white/20' : 'bg-slate-200 text-slate-700',
                )}
              >
                {unhandled}
              </span>
            )}
          </button>
        ))}
      </div>

      {listQuery.isError && (
        <Alert variant="error" title="Could not load replies">
          Try again in a moment.
        </Alert>
      )}

      {listQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : replies.length === 0 ? (
        <EmptyState
          icon={status === 'unhandled' ? Inbox : MessageSquare}
          title={status === 'unhandled' ? 'Nothing waiting' : 'No replies yet'}
          description={
            status === 'unhandled'
              ? 'Every reply has been dealt with.'
              : "When someone texts the church's number back, it lands here."
          }
        />
      ) : (
        <div className="space-y-3">
          {replies.map((reply) => (
            <ReplyRow
              key={reply.id}
              reply={reply}
              onToggle={toggleMutation.mutate}
              isPending={toggleMutation.isPending && toggleMutation.variables?.id === reply.id}
            />
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          totalItems={meta.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
