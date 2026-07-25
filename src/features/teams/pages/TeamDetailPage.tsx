import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  UserCheck,
  ClipboardList,
  UserPlus,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { TeamMemberList } from '../components/TeamMemberList';
import { AssignmentModal } from '../components/AssignmentModal';
import { teamsApi } from '../api/teams.api';
import { memberAssignmentsApi } from '../api/member-assignments.api';
import type { TeamUser } from '@/types/team';
import { formatDate, formatMemberName } from '@/lib/formatters';
import type { ApiError } from '@/types';

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TeamUser | null>(null);

  const {
    data: team,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['team', id],
    queryFn: () => teamsApi.getTeam(id as string).then((res) => res.data),
    enabled: !!id,
  });

  const { data: assignments } = useQuery({
    queryKey: ['member-assignments', { teamId: id }],
    queryFn: () =>
      memberAssignmentsApi
        .getMemberAssignments({ teamId: id, active: true, pageSize: 50 })
        .then((res) => res.data.data),
    enabled: !!id,
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => teamsApi.removeTeamUser(id as string, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      setRemoveTarget(null);
    },
  });

  if (!id) {
    return <EmptyState title="Team not found" description="The team you are looking for does not exist." />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (isError || !team) {
    return (
      <Alert variant="error" title="Failed to load team">
        {(error as { response?: { data?: ApiError } } | undefined)?.response?.data?.message ??
          'This team could not be found.'}
      </Alert>
    );
  }

  const workers = team.teamUsers ?? [];
  const leader = workers.find((w) => w.isPrimaryLeader) ?? workers.find((w) => w.teamRole === 'LEADER');
  const isActive = team.status === 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/teams" className="hover:text-indigo-600">
          Teams
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">{team.name}</span>
      </nav>

      <PageHeader
        title={team.name}
        actions={
          <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setShowAssignmentModal(true)}>
            Add Worker
          </Button>
        }
      />

      {/* Team Info */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              {team.description && <p className="text-sm text-slate-600">{team.description}</p>}
              {leader && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">{formatMemberName(leader.user)}</span>
                  <Badge variant="purple" size="sm">
                    Leader
                  </Badge>
                </div>
              )}
              <p className="text-xs text-slate-500">Created {formatDate(team.createdAt)}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 text-sm">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span className={isActive ? 'text-emerald-700' : 'text-slate-500'}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{workers.length}</p>
              <p className="text-sm text-slate-500">Team Workers</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100">
              <UserCheck className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{team._count?.memberAssignments ?? 0}</p>
              <p className="text-sm text-slate-500">Assigned Members</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <ClipboardList className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{team._count?.followUpTasks ?? 0}</p>
              <p className="text-sm text-slate-500">Follow-Up Tasks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {removeMutation.isError && (
        <Alert variant="error" title="Failed to remove worker">
          {(removeMutation.error as { response?: { data?: ApiError } })?.response?.data?.message ??
            'Please try again.'}
        </Alert>
      )}

      {/* Workers Table */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Team Workers</h2>
        <Card>
          <TeamMemberList members={workers} onRemove={(member) => setRemoveTarget(member)} />
        </Card>
      </div>

      {/* Assigned Members */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Assigned Members</h2>
        <Card>
          {!assignments || assignments.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No members assigned"
              description="Church members assigned to this team's workers for follow-up will appear here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Primary Worker</TableHead>
                  <TableHead>Backup Worker</TableHead>
                  <TableHead>Assigned Since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium text-slate-900">
                      {formatMemberName(assignment.member)}
                    </TableCell>
                    <TableCell>{formatMemberName(assignment.primaryWorker)}</TableCell>
                    <TableCell>
                      {assignment.backupWorker ? formatMemberName(assignment.backupWorker) : '--'}
                    </TableCell>
                    <TableCell className="text-slate-500">{formatDate(assignment.startsAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        teamId={id}
        existingUserIds={workers.map((w) => w.userId)}
      />

      {/* Remove worker confirmation */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <Card className="w-full max-w-sm">
            <div className="space-y-4 p-6">
              <h3 className="text-base font-semibold text-slate-900">Remove worker?</h3>
              <p className="text-sm text-slate-600">
                {formatMemberName(removeTarget.user)} will be removed from this team.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setRemoveTarget(null)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={removeMutation.isPending}
                  onClick={() => removeMutation.mutate(removeTarget.userId)}
                >
                  Remove
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
