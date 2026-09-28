/**
 * Registrations that came through one person's link while the member belongs
 * to someone else.
 *
 * This list only exists because the link deliberately refused to move them.
 * Without it nobody would ever learn it happened — the registration succeeds,
 * the member stays put, and the person who did the inviting quietly gets no
 * credit and no contact. So both sides are named and the decision is a
 * leader's to make: sometimes the referrer genuinely brought them, sometimes
 * the existing worker has been walking with them for months.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, GitMerge } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import { eventsApi } from '../api/events.api';

export function ReferralConflictsCard({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const canReassign = usePermission('teams.assign_members');

  const { data: conflicts, isLoading } = useQuery({
    queryKey: ['referral-conflicts', eventId],
    queryFn: () => eventsApi.getReferralConflicts(eventId).then((res) => res.data),
  });

  const honour = useMutation({
    mutationFn: (registrationId: string) => eventsApi.honourReferral(eventId, registrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-conflicts', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-invite-links', eventId] });
      toast({ title: 'Member moved', variant: 'success' });
    },
    onError: () => toast({ title: 'Could not move that member', variant: 'error' }),
  });

  // Nothing to decide is the normal state; an empty card would be noise.
  if (isLoading || !conflicts || conflicts.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GitMerge className="h-4 w-4 text-amber-600" />
          Came through a link, but already assigned
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            {conflicts.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-slate-600">
          These people registered through someone&apos;s link but were already being followed up by
          somebody else, so nothing was changed. Move them only if the person whose link they used
          should now be the one walking with them.
        </p>
        <ul className="divide-y divide-slate-100">
          {conflicts.map((c) => (
            <li key={c.registrationId} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0 text-sm">
                <span className="font-medium text-slate-900">{c.memberName}</span>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-slate-500">
                  <span>with {c.currentlyWith}</span>
                  <span className="text-slate-300">({c.currentTeam})</span>
                  <ArrowRight className="h-3 w-3 text-slate-300" />
                  <span>came via {c.cameVia}</span>
                </div>
              </div>
              {canReassign && (
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={honour.isPending && honour.variables === c.registrationId}
                  onClick={() => honour.mutate(c.registrationId)}
                >
                  Move to {c.cameVia.split(' ')[0]}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
