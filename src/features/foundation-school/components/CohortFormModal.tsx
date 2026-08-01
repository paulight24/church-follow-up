import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, X, UserRound } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { foundationSchoolApi, instructorLookupApi } from '../api/foundation-school.api';
import type { CohortStatus } from '@/types/foundationSchool';

interface CohortFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CohortFormModal({ isOpen, onClose }: CohortFormModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const canSearchInstructors = usePermission('users.view');

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [graduationDate, setGraduationDate] = useState('');
  const [legacyInstructor, setLegacyInstructor] = useState('');
  const [instructorUserId, setInstructorUserId] = useState<string | null>(null);
  const [instructorName, setInstructorName] = useState<string | null>(null);
  const [instructorSearch, setInstructorSearch] = useState('');
  const [status, setStatus] = useState<CohortStatus>('PLANNED');
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(instructorSearch, 300);

  const { data: instructorResults, isFetching: isSearchingInstructors } = useQuery({
    queryKey: ['foundation-school', 'instructors', debouncedSearch],
    queryFn: () => instructorLookupApi.searchInstructors(debouncedSearch).then((res) => res.data.data),
    enabled: canSearchInstructors && debouncedSearch.length >= 2,
  });

  const resetForm = () => {
    setName('');
    setStartDate('');
    setGraduationDate('');
    setLegacyInstructor('');
    setInstructorUserId(null);
    setInstructorName(null);
    setInstructorSearch('');
    setStatus('PLANNED');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const createMutation = useMutation({
    mutationFn: foundationSchoolApi.createCohort,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foundation-school', 'cohorts'] });
      toast({ title: 'Batch created', variant: 'success' });
      handleClose();
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create batch';
      toast({ title: 'Error', description: message, variant: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !startDate) {
      setError('Batch name and start date are required.');
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      startDate: new Date(startDate).toISOString(),
      graduationDate: graduationDate ? new Date(graduationDate).toISOString() : undefined,
      instructorUserId: instructorUserId ?? undefined,
      // Fall back to the legacy free-text field only when no picker selection was made
      // (e.g. the actor doesn't have users.view) so a name is still recorded.
      instructor: !instructorUserId && legacyInstructor.trim() ? legacyInstructor.trim() : undefined,
      status,
    });
  };

  function selectInstructor(user: { id: string; firstName: string; lastName: string }) {
    setInstructorUserId(user.id);
    setInstructorName(`${user.firstName} ${user.lastName}`);
    setInstructorSearch('');
  }

  function clearInstructor() {
    setInstructorUserId(null);
    setInstructorName(null);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Foundation School Batch"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={createMutation.isPending}>
            Create Batch
          </Button>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <Input label="Batch Name" value={name} onChange={(e) => setName(e.target.value)} required />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePicker label="Start Date" value={startDate} onChange={setStartDate} />
          <DatePicker label="Graduation Date (optional)" value={graduationDate} onChange={setGraduationDate} />
        </div>

        {canSearchInstructors ? (
          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Instructor (optional)</label>

            {instructorName ? (
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <UserRound className="h-4 w-4 text-slate-400" />
                  {instructorName}
                </span>
                <button
                  type="button"
                  onClick={clearInstructor}
                  className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  aria-label="Remove instructor"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Input
                  leftIcon={<Search className="h-4 w-4" />}
                  placeholder="Search users by name or email..."
                  value={instructorSearch}
                  onChange={(e) => setInstructorSearch(e.target.value)}
                />
                {debouncedSearch.length >= 2 && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                    {isSearchingInstructors ? (
                      <p className="px-3 py-2 text-sm text-slate-500">Searching...</p>
                    ) : (instructorResults ?? []).length === 0 ? (
                      <p className="px-3 py-2 text-sm text-slate-500">No users found</p>
                    ) : (
                      instructorResults!.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => selectInstructor(user)}
                          className={cn(
                            'flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50',
                          )}
                        >
                          <span>
                            {user.firstName} {user.lastName}
                            {user.email && <span className="text-slate-400"> · {user.email}</span>}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                <p className="mt-1 text-xs text-slate-400">Type at least 2 characters to search for a person to assign.</p>
              </>
            )}
          </div>
        ) : (
          <Input
            label="Instructor (optional)"
            placeholder="e.g. Pastor John"
            helpText="You don't have permission to search the user directory, so this is stored as plain text rather than linked to a person."
            value={legacyInstructor}
            onChange={(e) => setLegacyInstructor(e.target.value)}
          />
        )}

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as CohortStatus)}
          options={[
            { label: 'Planned', value: 'PLANNED' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Cancelled', value: 'CANCELLED' },
          ]}
        />
      </form>
    </Modal>
  );
}
