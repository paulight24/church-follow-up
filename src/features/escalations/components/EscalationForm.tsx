import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ShieldAlert } from 'lucide-react';
import type { Escalation } from '@/types/escalation';
import { ESCALATION_TYPES, ESCALATION_PRIORITY } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

const escalationSchema = z.object({
  memberId: z.string().min(1, 'Please select a member'),
  type: z.string().min(1, 'Please select a type'),
  priority: z.string().min(1, 'Please select a priority'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().min(1, 'Description is required'),
  confidentialNotes: z.string().optional(),
  assignedToId: z.string().optional(),
});

type EscalationFormData = z.infer<typeof escalationSchema>;

interface EscalationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<Escalation>;
}

export function EscalationForm({
  onSuccess,
  onCancel,
  initialData,
}: EscalationFormProps) {
  const [showConfidential, setShowConfidential] = useState(
    Boolean(initialData?.confidentialNotes),
  );
  const isEditing = Boolean(initialData?.id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EscalationFormData>({
    resolver: zodResolver(escalationSchema),
    defaultValues: {
      memberId: initialData?.memberId ?? '',
      type: initialData?.type ?? '',
      priority: initialData?.priority ?? '',
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      confidentialNotes: initialData?.confidentialNotes ?? '',
      assignedToId: initialData?.assignedToId ?? '',
    },
  });

  const onSubmit = async (_data: EscalationFormData) => {
    // API call would go here
    onSuccess();
  };

  const typeOptions = ESCALATION_TYPES.map((t) => ({
    label: t.label,
    value: t.value,
  }));

  const priorityOptions = ESCALATION_PRIORITY.map((p) => ({
    label: p.label,
    value: p.value,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Member"
        placeholder="Search for member..."
        error={errors.memberId?.message}
        {...register('memberId')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Type"
          placeholder="Select type"
          options={typeOptions}
          error={errors.type?.message}
          {...register('type')}
        />

        <Select
          label="Priority"
          placeholder="Select priority"
          options={priorityOptions}
          error={errors.priority?.message}
          {...register('priority')}
        />
      </div>

      <Input
        label="Title"
        placeholder="Brief title for the escalation"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="Description"
        placeholder="Provide details about the escalation..."
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Confidential Notes Toggle */}
      <div className="rounded-lg border border-slate-200 p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={showConfidential}
            onChange={(e) => setShowConfidential(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <Lock className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">
            Add confidential notes
          </span>
        </label>

        {showConfidential && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700">
                These notes are confidential and restricted to authorized
                personnel only
              </p>
            </div>
            <Textarea
              placeholder="Enter confidential notes..."
              rows={3}
              {...register('confidentialNotes')}
            />
          </div>
        )}
      </div>

      <Input
        label="Assign To"
        placeholder="Search for team member..."
        {...register('assignedToId')}
      />

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? 'Update Escalation' : 'Create Escalation'}
        </Button>
      </div>
    </form>
  );
}
