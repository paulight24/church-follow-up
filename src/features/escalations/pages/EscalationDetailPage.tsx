import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { Phone, UserPlus, CheckCircle, Clock } from 'lucide-react';
import type { ApiError } from '@/types';
import type { EscalationStatus } from '@/types/escalation';
import { formatDate, formatDateTime, formatMemberName } from '@/lib/formatters';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { usePermission } from '@/hooks/usePermission';
import { ConfidentialNote } from '../components/ConfidentialNote';
import { escalationsApi } from '../api/escalations.api';
import { searchUsers, type UserLookup } from '../api/lookup.api';
import { CATEGORY_LABELS, NEXT_STATUS_OPTIONS, PRIORITY_BADGE, PRIORITY_LABELS, STATUS_BADGE, STATUS_LABELS } from '../lib/escalationDisplay';

export function EscalationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const escalationId = id!;
  const queryClient = useQueryClient();
  const canUpdate = usePermission('escalations.update') || usePermission('escalations.assign') || usePermission('escalations.resolve');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const { data: escalation, isLoading, isError } = useQuery({
    queryKey: ['escalation', escalationId],
    queryFn: () => escalationsApi.getEscalation(escalationId).then((r) => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: (status: EscalationStatus) => escalationsApi.updateEscalation(escalationId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation', escalationId] });
      queryClient.invalidateQueries({ queryKey: ['escalations'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !escalation) {
    return (
      <div className="space-y-6">
        <PageHeader title="Escalation" breadcrumbs={[{ label: 'Escalations', href: '/escalations' }, { label: 'Detail' }]} />
        <Card>
          <CardContent className="py-12 text-center text-sm text-rose-600">This escalation could not be found.</CardContent>
        </Card>
      </div>
    );
  }

  const nextStatuses = NEXT_STATUS_OPTIONS[escalation.status];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${formatMemberName(escalation.member)} - ${CATEGORY_LABELS[escalation.category] ?? escalation.category}`}
        breadcrumbs={[{ label: 'Escalations', href: '/escalations' }, { label: 'Detail' }]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={STATUS_BADGE[escalation.status]} dot>
          {STATUS_LABELS[escalation.status]}
        </Badge>
        <Badge variant={PRIORITY_BADGE[escalation.priority]}>{PRIORITY_LABELS[escalation.priority]} Priority</Badge>
        <Badge variant="default">{CATEGORY_LABELS[escalation.category] ?? escalation.category}</Badge>
        <span className="text-sm text-slate-500">Reported {formatDate(escalation.createdAt)}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{escalation.summary}</p>
            </CardContent>
          </Card>

          {escalation.isConfidential && (
            <Card>
              <CardHeader>
                <CardTitle>Confidential Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <ConfidentialNote escalationId={escalation.id} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <TimelineRow icon={Clock} label="Reported" date={escalation.createdAt} by={formatMemberName(escalation.createdBy)} />
                {escalation.acknowledgedAt && <TimelineRow icon={Clock} label="Acknowledged" date={escalation.acknowledgedAt} />}
                {escalation.resolvedAt && <TimelineRow icon={CheckCircle} label="Resolved / Closed" date={escalation.resolvedAt} />}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Member Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900">{formatMemberName(escalation.member)}</p>
                {escalation.task && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>Linked follow-up task ({escalation.task.status})</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">Reported By</dt>
                  <dd className="mt-0.5 text-sm text-slate-900">{formatMemberName(escalation.createdBy)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">Assigned To</dt>
                  <dd className="mt-0.5 text-sm text-slate-900">
                    {escalation.assignedTo ? formatMemberName(escalation.assignedTo) : 'Unassigned'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">Created</dt>
                  <dd className="mt-0.5 text-sm text-slate-900">{formatDateTime(escalation.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-500">Last Updated</dt>
                  <dd className="mt-0.5 text-sm text-slate-900">{formatDateTime(escalation.updatedAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {canUpdate && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    leftIcon={<UserPlus className="h-4 w-4" />}
                    className="w-full justify-start"
                    onClick={() => setShowAssignModal(true)}
                  >
                    {escalation.assignedTo ? 'Reassign' : 'Assign'}
                  </Button>
                  {nextStatuses.map((status) => (
                    <Button
                      key={status}
                      variant={status === 'RESOLVED' || status === 'CLOSED' ? 'primary' : 'secondary'}
                      leftIcon={<CheckCircle className="h-4 w-4" />}
                      className="w-full justify-start"
                      isLoading={statusMutation.isPending && statusMutation.variables === status}
                      onClick={() => statusMutation.mutate(status)}
                    >
                      Mark as {STATUS_LABELS[status]}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        escalationId={escalation.id}
      />
    </div>
  );
}

function TimelineRow({
  icon: Icon,
  label,
  date,
  by,
}: {
  icon: typeof Clock;
  label: string;
  date: string;
  by?: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100">
        <Icon className="h-4 w-4 text-indigo-600" />
      </div>
      <div>
        <p className="font-medium text-slate-900">
          {label}
          {by && <span className="ml-1 text-xs font-normal text-slate-400">by {by}</span>}
        </p>
        <p className="text-xs text-slate-400">{formatDateTime(date)}</p>
      </div>
    </li>
  );
}

function AssignModal({
  isOpen,
  onClose,
  escalationId,
}: {
  isOpen: boolean;
  onClose: () => void;
  escalationId: string;
}) {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['user-search-assign'],
    queryFn: () => searchUsers().then((r) => r.data),
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: (toUserId: string) => escalationsApi.updateEscalation(escalationId, { assignedToUserId: toUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation', escalationId] });
      queryClient.invalidateQueries({ queryKey: ['escalations'] });
      setSelectedUserId('');
      onClose();
    },
    onError: (err: AxiosError<ApiError>) => {
      setError(err.response?.data?.message ?? 'Failed to assign escalation.');
    },
  });

  const userOptions = (users?.data ?? []).map((u: UserLookup) => ({
    label: `${u.firstName} ${u.lastName}`,
    value: u.id,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Escalation" size="sm">
      <div className="space-y-4">
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : (
          <Select
            label="Assign To"
            placeholder="Select a team member..."
            options={userOptions}
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          />
        )}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            disabled={!selectedUserId}
            isLoading={mutation.isPending}
            onClick={() => {
              setError(null);
              mutation.mutate(selectedUserId);
            }}
          >
            Assign
          </Button>
        </div>
      </div>
    </Modal>
  );
}
