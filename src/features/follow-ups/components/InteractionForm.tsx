import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Channel, Outcome } from '@/types/followUp';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { CHANNELS, OUTCOMES } from '@/lib/constants';
import { followUpsApi } from '../api/follow-ups.api';

const interactionSchema = z.object({
  channel: z.string().min(1, 'Channel is required'),
  outcome: z.string().min(1, 'Outcome is required'),
  notes: z.string().optional(),
  duration: z
    .number({ invalid_type_error: 'Must be a number' })
    .int('Must be a whole number')
    .min(1, 'Must be at least 1 minute')
    .optional()
    .or(z.literal('')),
  scheduledCallbackDate: z.string().optional(),
});

type InteractionFormValues = z.infer<typeof interactionSchema>;

interface InteractionFormProps {
  taskId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const channelOptions = CHANNELS.map((c) => ({ label: c.label, value: c.value }));
const outcomeOptions = OUTCOMES.map((o) => ({ label: o.label, value: o.value }));

export function InteractionForm({ taskId, onSuccess, onCancel }: InteractionFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      channel: '',
      outcome: '',
      notes: '',
      duration: undefined,
      scheduledCallbackDate: '',
    },
  });

  const selectedOutcome = watch('outcome');

  const onSubmit = async (values: InteractionFormValues) => {
    setSubmitError(null);

    try {
      await followUpsApi.createInteraction(taskId, {
        channel: values.channel as Channel,
        outcome: values.outcome as Outcome,
        notes: values.notes || undefined,
        duration: typeof values.duration === 'number' ? values.duration : undefined,
        scheduledCallbackDate: values.scheduledCallbackDate || undefined,
      });

      onSuccess();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to log interaction. Please try again.';
      setSubmitError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {submitError && (
        <Alert variant="error">
          {submitError}
        </Alert>
      )}

      <Select
        label="Channel"
        placeholder="Select channel..."
        options={channelOptions}
        error={errors.channel?.message}
        {...register('channel')}
      />

      <Select
        label="Outcome"
        placeholder="Select outcome..."
        options={outcomeOptions}
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
        label="Duration (minutes)"
        type="number"
        placeholder="e.g. 5"
        min={1}
        error={errors.duration?.message}
        {...register('duration', { valueAsNumber: true })}
      />

      {selectedOutcome === 'REQUESTED_CALLBACK' && (
        <DatePicker
          label="Scheduled Callback Date"
          value={watch('scheduledCallbackDate') ?? ''}
          onChange={(val) => setValue('scheduledCallbackDate', val)}
          min={new Date().toISOString().split('T')[0]}
          error={errors.scheduledCallbackDate?.message}
        />
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Log Interaction
        </Button>
      </div>
    </form>
  );
}
