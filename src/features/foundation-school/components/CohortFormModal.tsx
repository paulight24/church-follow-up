import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from '@/components/ui/Toast';
import { foundationSchoolApi } from '../api/foundation-school.api';
import type { CohortStatus } from '@/types/foundationSchool';

interface CohortFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CohortFormModal({ isOpen, onClose }: CohortFormModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [graduationDate, setGraduationDate] = useState('');
  const [instructor, setInstructor] = useState('');
  const [status, setStatus] = useState<CohortStatus>('PLANNED');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setStartDate('');
    setGraduationDate('');
    setInstructor('');
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
      toast({ title: 'Cohort created', variant: 'success' });
      handleClose();
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create cohort';
      toast({ title: 'Error', description: message, variant: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !startDate) {
      setError('Cohort name and start date are required.');
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      startDate: new Date(startDate).toISOString(),
      graduationDate: graduationDate ? new Date(graduationDate).toISOString() : undefined,
      instructor: instructor.trim() || undefined,
      status,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Foundation School Cohort"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={createMutation.isPending}>
            Create Cohort
          </Button>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <Input label="Cohort Name" value={name} onChange={(e) => setName(e.target.value)} required />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePicker label="Start Date" value={startDate} onChange={setStartDate} />
          <DatePicker label="Graduation Date (optional)" value={graduationDate} onChange={setGraduationDate} />
        </div>

        <Input
          label="Instructor (optional)"
          value={instructor}
          onChange={(e) => setInstructor(e.target.value)}
        />

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
