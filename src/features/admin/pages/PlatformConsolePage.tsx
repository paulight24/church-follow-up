import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, CheckCircle2, XCircle, PauseCircle, PlayCircle, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import {
  listPlatformChurches,
  approveChurch,
  setChurchStatus,
  listTierRequests,
  decideTierRequest,
} from '@/features/churches/api';

/**
 * SaaS operator console — visible only to platform admins. Approves newly
 * registered churches, pauses/reactivates churches, and decides tier
 * requests. Deliberately spartan: an internal tool, not a tenant surface.
 */
export function PlatformConsolePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const churchesQuery = useQuery({ queryKey: ['platform', 'churches'], queryFn: () => listPlatformChurches() });
  const tierRequestsQuery = useQuery({ queryKey: ['platform', 'tier-requests'], queryFn: () => listTierRequests('PENDING') });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['platform'] });
  };

  const approveMutation = useMutation({
    mutationFn: approveChurch,
    onSuccess: () => {
      toast({ variant: 'success', title: 'Church approved' });
      invalidate();
    },
    onError: () => toast({ variant: 'error', title: 'Could not approve church' }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => setChurchStatus(id, status),
    onSuccess: () => {
      toast({ variant: 'success', title: 'Church status updated' });
      invalidate();
    },
    onError: () => toast({ variant: 'error', title: 'Could not update church status' }),
  });

  const decideMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'APPROVED' | 'REJECTED' }) =>
      decideTierRequest(id, decision),
    onSuccess: (_, vars) => {
      toast({ variant: 'success', title: `Tier request ${vars.decision.toLowerCase()}` });
      invalidate();
    },
    onError: () => toast({ variant: 'error', title: 'Could not decide tier request' }),
  });

  return (
    <div>
      <PageHeader
        title="Platform Console"
        subtitle="Churches on the platform, registrations awaiting approval, and tier requests"
      />

      {/* ── Pending tier requests ─────────────────────────── */}
      {(tierRequestsQuery.data?.length ?? 0) > 0 && (
        <div className="mb-8 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
            <Sparkles className="h-4 w-4" />
            Tier requests awaiting review
          </h2>
          <div className="mt-3 space-y-2">
            {tierRequestsQuery.data!.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-3 rounded-xl border border-indigo-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {request.church.name}
                    <span className="mx-2 text-slate-300">·</span>
                    <span className="text-slate-500">
                      {request.church.subscriptionTier} → <strong>{request.requestedTier}</strong>
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Requested by {request.requestedBy ? `${request.requestedBy.firstName} ${request.requestedBy.lastName}` : 'unknown'}{' '}
                    on {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                    isLoading={decideMutation.isPending}
                    onClick={() => decideMutation.mutate({ id: request.id, decision: 'APPROVED' })}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<XCircle className="h-4 w-4" />}
                    isLoading={decideMutation.isPending}
                    onClick={() => decideMutation.mutate({ id: request.id, decision: 'REJECTED' })}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Churches ──────────────────────────────────────── */}
      {churchesQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (churchesQuery.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Building2}
          title="No churches yet"
          description="Newly registered churches will appear here for approval."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Church</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">Members</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {churchesQuery.data!.map((church) => (
                <TableRow key={church.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">{church.name}</p>
                    <p className="text-xs text-slate-400">{church.churchCode}</p>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {[church.city, church.stateOrProvince].filter(Boolean).join(', ') || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        church.status === 'ACTIVE'
                          ? 'success'
                          : church.status === 'PENDING_APPROVAL'
                            ? 'warning'
                            : 'default'
                      }
                    >
                      {church.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">
                      {church.subscriptionTier === 'PREMIUM_AI' ? 'Premium + AI' : 'Standard'}
                    </span>
                    {church.subscriptionStatus === 'LAPSED' && (
                      <Badge variant="warning" className="ml-2">
                        LAPSED
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-600">{church.memberCount}</TableCell>
                  <TableCell className="text-right text-sm text-slate-600">{church.userCount}</TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(church.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {church.status === 'PENDING_APPROVAL' && (
                        <Button
                          size="sm"
                          leftIcon={<CheckCircle2 className="h-4 w-4" />}
                          isLoading={approveMutation.isPending}
                          onClick={() => approveMutation.mutate(church.id)}
                        >
                          Approve
                        </Button>
                      )}
                      {church.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<PauseCircle className="h-4 w-4" />}
                          isLoading={statusMutation.isPending}
                          onClick={() => statusMutation.mutate({ id: church.id, status: 'SUSPENDED' })}
                        >
                          Suspend
                        </Button>
                      )}
                      {church.status === 'SUSPENDED' && (
                        <Button
                          size="sm"
                          leftIcon={<PlayCircle className="h-4 w-4" />}
                          isLoading={statusMutation.isPending}
                          onClick={() => statusMutation.mutate({ id: church.id, status: 'ACTIVE' })}
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
