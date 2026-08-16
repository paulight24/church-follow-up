import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Channel, Outcome } from '@/types/followUp';
import type { ApiError } from '@/types';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { followUpTasksApi } from '../api/follow-up-tasks.api';
import { CHANNEL_OPTIONS, OUTCOME_OPTIONS } from '../lib/taskDisplay';

const interactionSchema = z.object({
  channel: z.string().min(1, 'Channel is required'),
  outcome: z.string().min(1, 'Outcome is required'),
  notes: z.string().optional(),
  nextAction: z.string().optional(),
  nextFollowUpAt: z.string().optional(),
  requiresEscalation: z.boolean().optional(),
});

type InteractionFormValues = z.infer<typeof interactionSchema>;

interface InteractionFormProps {
  taskId: string;
  onSuccess: () => void;
  onCancel: () => void;
  presetOutcome?: Outcome | '';
}

const callbackOutcomes = new Set<Outcome>(['SCHEDULED_CALLBACK']);

export function InteractionForm({ taskId, onSuccess, onCancel, presetOutcome }: InteractionFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      channel: '',
      outcome: presetOutcome || '',
      notes: '',
      nextAction: '',
      nextFollowUpAt: '',
      requiresEscalation: false,
    },
  });

  useEffect(() => {
    if (presetOutcome) setValue('outcome', presetOutcome);
  }, [presetOutcome, setValue]);

  const selectedOutcome = watch('outcome') as Outcome | '';

  const mutation = useMutation({
    mutationFn: (values: InteractionFormValues) =>
      followUpTasksApi.createInteraction(taskId, {
        channel: values.channel as Channel,
        outcome: values.outcome as Outcome,
        notes: values.notes || undefined,
        nextAction: values.nextAction || undefined,
        nextFollowUpAt: values.nextFollowUpAt || undefined,
        requiresEscalation: values.requiresEscalation || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-up-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['follow-up-tasks', taskId] });
      queryClient.invalidateQueries({ queryKey: ['follow-up-task-interactions', taskId] });
      onSuccess();
    },
    onError: (error: AxiosError<ApiError>) => {
      setSubmitError(error.response?.data?.message ?? 'Failed to log interaction. Please try again.');
    },
  });

  const onSubmit = (values: InteractionFormValues) => {
    setSubmitError(null);
    mutation.mutate(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {submitError && <Alert variant="error">{submitError}</Alert>}

      <Select
        label="Channel"
        placeholder="Select channel..."
        options={CHANNEL_OPTIONS}
        error={errors.channel?.message}
        {...register('channel')}
      />

      <Select
        label="Outcome"
        placeholder="Select outcome..."
        options={OUTCOME_OPTIONS}
        error={errors.outcome?.message}
        {...register('outcome')}
      />

      <Textarea
        label="Notes"
        placeholder="Enter any notes about this interaction..."
        rows={3}
        error={errors.notes?.message}
        {...register('notes')}
      />

      <Input
        label="Next Action"
        placeholder="e.g. Call back next week"
        error={errors.nextAction?.message}
        {...register('nextAction')}
      />

      {selectedOutcome && callbackOutcomes.has(selectedOutcome) && (
        <DatePicker
          label="Next Follow-Up Date"
          value={watch('nextFollowUpAt')?.slice(0, 10) ?? ''}
          onChange={(val) => setValue('nextFollowUpAt', val ? new Date(val).toISOString() : '')}
          min={new Date().toISOString().split('T')[0]}
        />
      )}

      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          {...register('requiresEscalation')}
        />
        This requires pastoral escalation
      </label>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" isLoading={mutation.isPending}>
          Log Interaction
        </Button>
      </div>
    </form>
  );
}
