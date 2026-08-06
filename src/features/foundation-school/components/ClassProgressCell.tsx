import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/cn';
import { Dropdown } from '@/components/ui/Dropdown';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import { foundationSchoolApi } from '../api/foundation-school.api';
import type { ClassProgressStatus, FoundationSchoolClassProgress } from '@/types/foundationSchool';

const STATUS_OPTIONS: ClassProgressStatus[] = [
  'NOT_STARTED',
  'SCHEDULED',
  'ATTENDED',
  'MISSED',
  'EXCUSED',
  'MAKE_UP_REQUIRED',
  'COMPLETED',
];

const STATUS_STYLES: Record<ClassProgressStatus, string> = {
  NOT_STARTED: 'bg-slate-100 text-slate-400 border-slate-200',
  SCHEDULED: 'bg-sky-100 text-sky-700 border-sky-200',
  ATTENDED: 'bg-blue-100 text-blue-700 border-blue-200',
  MISSED: 'bg-rose-100 text-rose-700 border-rose-200',
  EXCUSED: 'bg-amber-100 text-amber-700 border-amber-200',
  MAKE_UP_REQUIRED: 'bg-orange-100 text-orange-700 border-orange-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

function statusLabel(status: ClassProgressStatus): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ClassProgressCellProps {
  progress: FoundationSchoolClassProgress;
}

export function ClassProgressCell({ progress }: ClassProgressCellProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // Reachable from any page that can view a cohort's roster; changing a
  // class's status needs foundation_school.mark_attendance specifically.
  const canMarkAttendance = usePermission('foundation_school.mark_attendance');

  const updateMutation = useMutation({
    mutationFn: (status: ClassProgressStatus) => {
      const data: { status: ClassProgressStatus; attendedDate?: string } = { status };
      if (status === 'ATTENDED' || status === 'COMPLETED') {
        data.attendedDate = new Date().toISOString();
      }
      return foundationSchoolApi.updateClassProgress(progress.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foundation-school'] });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update class';
      toast({ title: 'Error', description: message, variant: 'error' });
    },
  });

  const badge = (
    <span
      title={`Class ${progress.classNumber}: ${statusLabel(progress.status)}`}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold transition-colors',
        canMarkAttendance && 'hover:brightness-95',
        STATUS_STYLES[progress.status],
      )}
    >
      {progress.classNumber}
    </span>
  );

  if (!canMarkAttendance) {
    return badge;
  }

  return (
    <Dropdown
      align="left"
      trigger={badge}
      items={STATUS_OPTIONS.map((status) => ({
        label: statusLabel(status),
        onClick: () => updateMutation.mutate(status),
        variant: status === progress.status ? 'default' : 'default',
        disabled: status === progress.status,
      }))}
    />
  );
}
