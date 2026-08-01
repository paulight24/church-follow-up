import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';
import type { FollowUpTask } from '@/types/followUp';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { formatMemberName } from '@/lib/formatters';
import { followUpTasksApi } from '../api/follow-up-tasks.api';
import { teamsApi } from '@/features/teams/api/teams.api';
import { searchUsers } from '../api/user-lookup.api';

interface ReassignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: FollowUpTask | null;
}

export function ReassignTaskModal({ isOpen, onClose, task }: ReassignTaskModalProps) {
  const queryClient = useQueryClient();
  const [teamId, setTeamId] = useState('');
  const [toUserId, setToUserId] = useState('');
  const [reason, setReason] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: teams } = useQuery({
    queryKey: ['teams', 'lookup'],
    queryFn: () => teamsApi.getTeams({ pageSize: 100 }).then((res) => res.data.data),
    enabled: isOpen,
  });

  const { data: teamDetail } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamsApi.getTeam(teamId).then((res) => res.data),
    enabled: isOpen && Boolean(teamId),
  });

  const { data: allUsers } = useQuery({
    queryKey: ['users', 'lookup'],
    queryFn: () => searchUsers().then((res) => res.data.data),
    enabled: isOpen && !teamId,
  });

  const teamOptions = [
    { value: '', label: 'All staff' },
    ...(teams ?? []).map((t) => ({ value: t.id, label: t.name })),
  ];

  const assigneeOptions = (() => {
    if (teamId) {
      const staff = teamDetail?.teamUsers ?? [];
      const sorted = [...staff].sort((a, b) => {
        const rank = (u: typeof a) => (u.isPrimaryLeader ? 0 : u.teamRole === 'LEADER' ? 1 : 2);
        return rank(a) - rank(b);
      });
      return sorted.map((tu) => ({
        value: tu.userId,
        label:
          `${tu.user.firstName} ${tu.user.lastName}` +
          (tu.isPrimaryLeader ? ' — Primary Leader' : tu.teamRole === 'LEADER' ? ' — Leader' : ''),
      }));
    }
    return (allUsers ?? []).map((u) => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName}`,
    }));
  })();

  const mutation = useMutation({
    mutationFn: () =>
      followUpTasksApi.reassignTask(task!.id, {
        toUserId,
        reason: reason.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-up-tasks'] });
      handleClose();
    },
    onError: (error: AxiosError<ApiError>) => {
      setSubmitError(error.response?.data?.message ?? 'Failed to reassign this task.');
    },
  });

  function handleClose() {
    setTeamId('');
    setToUserId('');
    setReason('');
    setSubmitError(null);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={task ? `Reassign — ${formatMemberName(task.member)}` : 'Reassign Task'}
    >
      <div className="space-y-5">
        {submitError && <Alert variant="error">{submitError}</Alert>}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Currently assigned to</label>
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {task?.assignedUser ? formatMemberName(task.assignedUser) : 'Unassigned'}
          </p>
        </div>

        <Select
          label="Team"
          options={teamOptions}
          value={teamId}
          onChange={(e) => {
            setTeamId(e.target.value);
            setToUserId('');
          }}
          helpText="Narrow the list to one team's workers"
        />

        <Select
          label="Reassign to"
          placeholder="Select a person"
          options={assigneeOptions}
          value={toUserId}
          onChange={(e) => setToUserId(e.target.value)}
        />

        <Input
          label="Reason (optional)"
          placeholder="e.g. Handing off to cell leader"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              setSubmitError(null);
              mutation.mutate();
            }}
            isLoading={mutation.isPending}
            disabled={!toUserId}
          >
            Reassign
          </Button>
        </div>
      </div>
    </Modal>
  );
}
