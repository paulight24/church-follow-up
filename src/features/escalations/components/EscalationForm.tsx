import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { Lock, ShieldAlert, Search, Check } from 'lucide-react';
import type { ApiError } from '@/types';
import type { EscalationCategory, EscalationPriority } from '@/types/escalation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useDebounce } from '@/hooks/useDebounce';
import { escalationsApi } from '../api/escalations.api';
import { searchMembers, type MemberLookup } from '../api/lookup.api';
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from '../lib/escalationDisplay';

const escalationSchema = z.object({
  memberId: z.string().min(1, 'Please select a member'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.string().min(1, 'Please select a priority'),
  summary: z.string().min(1, 'Summary is required').max(1000, 'Summary must be 1000 characters or less'),
  isConfidential: z.boolean(),
});

type EscalationFormData = z.infer<typeof escalationSchema>;

interface EscalationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  memberId?: string;
  taskId?: string;
}

export function EscalationForm({ onSuccess, onCancel, memberId, taskId }: EscalationFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EscalationFormData>({
    resolver: zodResolver(escalationSchema),
    defaultValues: {
      memberId: memberId ?? '',
      category: '',
      priority: 'NORMAL',
      summary: '',
      isConfidential: true,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: EscalationFormData) =>
      escalationsApi.createEscalation({
        memberId: values.memberId,
        taskId,
        category: values.category as EscalationCategory,
        priority: values.priority as EscalationPriority,
        summary: values.summary,
        isConfidential: values.isConfidential,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalations'] });
      onSuccess();
    },
    onError: (error: AxiosError<ApiError>) => {
      setSubmitError(error.response?.data?.message ?? 'Failed to create escalation. Please try again.');
    },
  });

  const categoryOptions = CATEGORY_OPTIONS;
  const priorityOptions = PRIORITY_OPTIONS;

  return (
    <form
      onSubmit={handleSubmit((values) => {
        setSubmitError(null);
        mutation.mutate(values);
      })}
      className="space-y-5"
    >
      {submitError && <Alert variant="error">{submitError}</Alert>}

      <Controller
        control={control}
        name="memberId"
        render={({ field }) => (
          <MemberPicker value={field.value} onChange={field.onChange} disabled={!!memberId} error={errors.memberId?.message} />
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Category"
          placeholder="Select category"
          options={categoryOptions}
          error={errors.category?.message}
          {...register('category')}
        />

        <Select label="Priority" options={priorityOptions} error={errors.priority?.message} {...register('priority')} />
      </div>

      <Textarea
        label="Summary"
        placeholder="Describe the pastoral need and any relevant context..."
        rows={4}
        error={errors.summary?.message}
        {...register('summary')}
      />

      <div className="rounded-lg border border-slate-200 p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={watch('isConfidential')}
            onChange={(e) => setValue('isConfidential', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <Lock className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Mark as confidential</span>
        </label>
        <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700">
            Detailed pastoral notes are added separately once the escalation is created, and are only visible to
            authorized personnel.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" isLoading={mutation.isPending}>
          Report Escalation
        </Button>
      </div>
    </form>
  );
}

interface MemberPickerProps {
  value: string;
  onChange: (memberId: string) => void;
  disabled?: boolean;
  error?: string;
}

function MemberPicker({ value, onChange, disabled, error }: MemberPickerProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<MemberLookup | null>(null);
  const debouncedQuery = useDebounce(query, 300);

  const { data } = useQuery({
    queryKey: ['member-search', debouncedQuery],
    queryFn: () => searchMembers(debouncedQuery).then((r) => r.data),
    enabled: debouncedQuery.length >= 2 && !selected,
  });

  const results = data?.data ?? [];

  const handleSelect = (member: MemberLookup) => {
    setSelected(member);
    setQuery('');
    onChange(member.id);
  };

  const handleClear = () => {
    setSelected(null);
    onChange('');
  };

  if (disabled && value) {
    return (
      <div className="w-full">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Member</label>
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Linked to the originating follow-up task
        </p>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="w-full">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Member</label>
        <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2">
          <span className="flex items-center gap-2 text-sm text-slate-900">
            <Check className="h-4 w-4 text-emerald-500" />
            {selected.preferredName ?? selected.firstName} {selected.lastName}
          </span>
          <button type="button" onClick={handleClear} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Input
        label="Member"
        placeholder="Search by name..."
        leftIcon={<Search className="h-4 w-4" />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        error={error}
      />
      {debouncedQuery.length >= 2 && results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.map((member) => (
            <li key={member.id}>
              <button
                type="button"
                onClick={() => handleSelect(member)}
                className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50"
              >
                {member.preferredName ?? member.firstName} {member.lastName}
                {member.phonePrimary && <span className="ml-2 text-xs text-slate-400">{member.phonePrimary}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {debouncedQuery.length >= 2 && results.length === 0 && (
        <p className="mt-1.5 text-sm text-slate-400">No members found.</p>
      )}
    </div>
  );
}
