import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { Lock, Unlock, ShieldAlert, Plus } from 'lucide-react';
import type { ApiError } from '@/types';
import type { NoteVisibilityLevel } from '@/types/escalation';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { formatDateTime, formatMemberName } from '@/lib/formatters';
import { usePermission } from '@/hooks/usePermission';
import { escalationsApi } from '../api/escalations.api';

interface ConfidentialNoteProps {
  escalationId: string;
  className?: string;
}

const visibilityOptions: { label: string; value: NoteVisibilityLevel }[] = [
  { label: 'Pastoral Team', value: 'PASTORAL_TEAM' },
  { label: 'Pastor Only', value: 'PASTOR_ONLY' },
  { label: 'Leadership', value: 'LEADERSHIP' },
];

const noteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(10000),
  visibilityLevel: z.string().min(1),
});
type NoteValues = z.infer<typeof noteSchema>;

/**
 * Confidential pastoral notes are only ever fetched/added when the caller
 * holds the relevant permission - per spec, the backend gates note content
 * behind escalations.view_confidential_notes / manage_confidential_notes,
 * so this component mirrors that on the frontend instead of always
 * attempting the call and eating a 403.
 */
export function ConfidentialNote({ escalationId, className }: ConfidentialNoteProps) {
  const canView = usePermission('escalations.view_confidential_notes');
  const canManage = usePermission('escalations.manage_confidential_notes');

  if (!canView && !canManage) {
    return (
      <div className={cn('rounded-lg border border-slate-200 bg-slate-50 p-4', className)}>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Lock className="h-4 w-4 shrink-0" />
          You do not have permission to view confidential pastoral notes.
        </div>
      </div>
    );
  }

  return <ConfidentialNoteContent escalationId={escalationId} canView={canView} canManage={canManage} className={className} />;
}

function ConfidentialNoteContent({
  escalationId,
  canView,
  canManage,
  className,
}: {
  escalationId: string;
  canView: boolean;
  canManage: boolean;
  className?: string;
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ['pastoral-notes', escalationId],
    queryFn: () => escalationsApi.getNotes(escalationId).then((r) => r.data),
    enabled: canView,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { content: '', visibilityLevel: 'PASTORAL_TEAM' },
  });

  const mutation = useMutation({
    mutationFn: (values: NoteValues) =>
      escalationsApi.createNote(escalationId, {
        content: values.content,
        visibilityLevel: values.visibilityLevel as NoteVisibilityLevel,
      }),
    onSuccess: () => {
      reset();
      setSubmitError(null);
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ['pastoral-notes', escalationId] });
      queryClient.invalidateQueries({ queryKey: ['escalation', escalationId] });
    },
    onError: (error: AxiosError<ApiError>) => {
      setSubmitError(error.response?.data?.message ?? 'Failed to add note.');
    },
  });

  return (
    <div className={cn('rounded-lg border border-rose-200 bg-rose-50', className)}>
      <div className="p-4">
        {canView && (
          <>
            {isLoading && (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            )}

            {!isLoading && !isRevealed && (
              <div className="flex flex-col items-center justify-center gap-2 py-4">
                <Lock className="h-6 w-6 text-rose-400" />
                <Button variant="outline" size="sm" leftIcon={<Unlock className="h-3.5 w-3.5" />} onClick={() => setIsRevealed(true)}>
                  Reveal {notes ? `(${notes.length})` : ''}
                </Button>
              </div>
            )}

            {!isLoading && isRevealed && (
              <div className="space-y-3">
                {(!notes || notes.length === 0) && (
                  <p className="text-sm text-slate-500">No confidential notes recorded yet.</p>
                )}
                {notes?.map((note) => (
                  <div key={note.id} className="rounded-md bg-white/70 p-3">
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{note.content}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {note.author ? formatMemberName(note.author) : 'Unknown'} &middot; {formatDateTime(note.createdAt)} &middot;{' '}
                      {note.visibilityLevel.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))}
                <Button variant="outline" size="sm" leftIcon={<Lock className="h-3.5 w-3.5" />} onClick={() => setIsRevealed(false)}>
                  Hide
                </Button>
              </div>
            )}
          </>
        )}

        {!canView && (
          <p className="text-sm text-slate-500">You can add notes, but do not have permission to view existing ones.</p>
        )}

        {canManage && (
          <div className="mt-4 border-t border-rose-200 pt-4">
            {!showAddForm ? (
              <Button variant="outline" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => setShowAddForm(true)}>
                Add Confidential Note
              </Button>
            ) : (
              <form
                onSubmit={handleSubmit((values) => {
                  setSubmitError(null);
                  mutation.mutate(values);
                })}
                className="space-y-3"
              >
                {submitError && <Alert variant="error">{submitError}</Alert>}
                <Textarea
                  placeholder="Enter confidential note..."
                  rows={3}
                  error={errors.content?.message}
                  {...register('content')}
                />
                <div className="flex items-end gap-3">
                  <div className="w-48">
                    <Select label="Visibility" options={visibilityOptions} {...register('visibilityLevel')} />
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddForm(false);
                        reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" isLoading={mutation.isPending}>
                      Save Note
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-rose-200 bg-rose-100/50 px-4 py-2">
        <ShieldAlert className="h-4 w-4 shrink-0 text-rose-500" />
        <p className="text-xs text-rose-600">This content is confidential and should only be viewed by authorized personnel</p>
      </div>
    </div>
  );
}
