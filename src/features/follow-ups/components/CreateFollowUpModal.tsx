import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';
import type { ReasonCode, TaskPriority } from '@/types/followUp';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { followUpTasksApi } from '../api/follow-up-tasks.api';
import { teamsApi } from '@/features/teams/api/teams.api';
import { searchUsers } from '../api/user-lookup.api';

const schema = z.object({
  reasonCode: z.string().min(1, 'Please select a reason'),
  priority: z.string().min(1, 'Please select a priority'),
  dueAt: z.string().min(1, 'Due date is required'),
  teamId: z.string().optional(),
  assignedUserId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const REASON_OPTIONS = [
  { value: 'MANUAL', label: 'Manual follow-up' },
  { value: 'NEW_VISITOR', label: 'New visitor' },
  { value: 'ABSENT', label: 'Absent member' },
  { value: 'PRAYER_REQUEST', label: 'Prayer request' },
  { value: 'PASTORAL_REQUEST', label: 'Pastoral request' },
  { value: 'CAMPAIGN_RESPONSE', label: 'Campaign response' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

interface CreateFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
}

export function CreateFollowUpModal({ isOpen, onClose, memberId, memberName }: CreateFollowUpModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDue = tomorrow.toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      reasonCode: 'MANUAL',
      priority: 'NORMAL',
      dueAt: defaultDue,
      teamId: '',
      assignedUserId: '',
    },
  });

  const selectedTeamId = useWatch({ control, name: 'teamId' });

  const { data: teams } = useQuery({
    queryKey: ['teams', 'lookup'],
    queryFn: () => teamsApi.getTeams({ pageSize: 100 }).then((res) => res.data.data),
    enabled: isOpen,
  });

  // When a team is chosen, the assignee list narrows to that team's staff so
  // leaders surface first; otherwise fall back to a flat user lookup.
  const { data: teamDetail } = useQuery({
    queryKey: ['team', selectedTeamId],
    queryFn: () => teamsApi.getTeam(selectedTeamId!).then((res) => res.data),
    enabled: isOpen && Boolean(selectedTeamId),
  });

  const { data: allUsers } = useQuery({
    queryKey: ['users', 'lookup'],
    queryFn: () => searchUsers().then((res) => res.data.data),
    enabled: isOpen && !selectedTeamId,
  });

  const teamOptions = [
    { value: '', label: 'No team' },
    ...(teams ?? []).map((t) => ({ value: t.id, label: t.name })),
  ];

  const assigneeOptions = (() => {
    if (selectedTeamId) {
      const staff = teamDetail?.teamUsers ?? [];
      // Leaders first - that's who a follow-up normally gets routed to.
      const sorted = [...staff].sort((a, b) => {
        const rank = (u: typeof a) => (u.isPrimaryLeader ? 0 : u.teamRole === 'LEADER' ? 1 : 2);
        return rank(a) - rank(b);
      });
      return [
        { value: '', label: 'Unassigned' },
        ...sorted.map((tu) => ({
          value: tu.userId,
          label:
            `${tu.user.firstName} ${tu.user.lastName}` +
            (tu.isPrimaryLeader ? ' — Primary Leader' : tu.teamRole === 'LEADER' ? ' — Leader' : ''),
        })),
      ];
    }
    return [
      { value: '', label: 'Unassigned' },
      ...(allUsers ?? []).map((u) => ({
        value: u.id,
        label: `${u.firstName} ${u.lastName}`,
      })),
    ];
  })();

  const mutation = useMutation({
    mutationFn: (values: FormData) =>
      followUpTasksApi.createTask({
        memberId,
        reasonCode: values.reasonCode as ReasonCode,
        priority: values.priority as TaskPriority,
        dueAt: new Date(values.dueAt).toISOString(),
        teamId: values.teamId || undefined,
        assignedUserId: values.assignedUserId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-up-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['members', memberId] });
      reset();
      onClose();
    },
    onError: (error: AxiosError<ApiError>) => {
      setSubmitError(error.response?.data?.message ?? 'Failed to create follow-up task.');
    },
  });

  const handleClose = () => {
    setSubmitError(null);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Follow-Up Task">
      <form
        onSubmit={handleSubmit((values) => {
          setSubmitError(null);
          mutation.mutate(values);
        })}
        className="space-y-5"
      >
        {submitError && <Alert variant="error">{submitError}</Alert>}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Member</label>
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {memberName}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Reason"
            options={REASON_OPTIONS}
            error={errors.reasonCode?.message}
            {...register('reasonCode')}
          />
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            error={errors.priority?.message}
            {...register('priority')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Team"
            options={teamOptions}
            error={errors.teamId?.message}
            {...register('teamId')}
          />
          <Select
            label="Assign to"
            options={assigneeOptions}
            helpText={selectedTeamId ? "Showing this team's workers" : 'Pick a team to narrow this list'}
            error={errors.assignedUserId?.message}
            {...register('assignedUserId')}
          />
        </div>

        <Input
          label="Due date"
          type="date"
          error={errors.dueAt?.message}
          {...register('dueAt')}
        />

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
