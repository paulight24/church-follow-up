import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';
import type { ReasonCode, TaskPriority } from '@/types/followUp';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { followUpTasksApi } from '../api/follow-up-tasks.api';

const schema = z.object({
  reasonCode: z.string().min(1, 'Please select a reason'),
  priority: z.string().min(1, 'Please select a priority'),
  dueAt: z.string().min(1, 'Due date is required'),
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
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      reasonCode: 'MANUAL',
      priority: 'NORMAL',
      dueAt: defaultDue,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormData) =>
      followUpTasksApi.createTask({
        memberId,
        reasonCode: values.reasonCode as ReasonCode,
        priority: values.priority as TaskPriority,
        dueAt: new Date(values.dueAt).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-up-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['member', memberId] });
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
