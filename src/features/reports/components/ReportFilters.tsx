import { useQuery } from '@tanstack/react-query';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { FOLLOW_UP_STATUS, TASK_PRIORITY } from '@/lib/constants';
import api from '@/config/api';
import type { ReportFilters as ReportFiltersState } from '@/types/report';

export type ReportFilterField =
  | 'dateRange'
  | 'team'
  | 'leader'
  | 'worker'
  | 'department'
  | 'fellowshipGroup'
  | 'status'
  | 'priority';

interface LookupOption {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

interface ReportFiltersProps {
  fields: ReportFilterField[];
  filters: ReportFiltersState;
  onChange: (filters: ReportFiltersState) => void;
  onGenerate: () => void;
  onExport: () => void;
  exportDisabled?: boolean;
  isLoading?: boolean;
}

function toDateInput(iso?: string): string {
  return iso ? iso.slice(0, 10) : '';
}

function fromDateInput(value: string, endOfDay = false): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (endOfDay) date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

export function ReportFilters({
  fields,
  filters,
  onChange,
  onGenerate,
  onExport,
  exportDisabled,
  isLoading,
}: ReportFiltersProps) {
  const teamsQuery = useQuery({
    queryKey: ['reports', 'lookup', 'teams'],
    queryFn: () => api.get<{ data: LookupOption[] }>('/teams', { params: { pageSize: 100 } }).then((r) => r.data.data ?? []),
    enabled: fields.includes('team'),
  });

  const usersQuery = useQuery({
    queryKey: ['reports', 'lookup', 'users'],
    queryFn: () => api.get<{ data: LookupOption[] }>('/users', { params: { pageSize: 100 } }).then((r) => r.data.data ?? []),
    enabled: fields.includes('leader') || fields.includes('worker'),
  });

  const departmentsQuery = useQuery({
    queryKey: ['reports', 'lookup', 'departments'],
    queryFn: () =>
      api.get<{ data: LookupOption[] }>('/departments', { params: { pageSize: 100 } }).then((r) => r.data.data ?? []),
    enabled: fields.includes('department'),
  });

  const fellowshipGroupsQuery = useQuery({
    queryKey: ['reports', 'lookup', 'fellowship-groups'],
    queryFn: () =>
      api.get<{ data: LookupOption[] }>('/fellowship-groups', { params: { pageSize: 100 } }).then((r) => r.data.data ?? []),
    enabled: fields.includes('fellowshipGroup'),
  });

  const userLabel = (u: LookupOption) => `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();

  const update = (patch: Partial<ReportFiltersState>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap items-end gap-4">
      {fields.includes('dateRange') && (
        <>
          <div className="w-full sm:w-44">
            <DatePicker
              label="Start Date"
              value={toDateInput(filters.startDate)}
              onChange={(v) => update({ startDate: fromDateInput(v) })}
            />
          </div>
          <div className="w-full sm:w-44">
            <DatePicker
              label="End Date"
              value={toDateInput(filters.endDate)}
              onChange={(v) => update({ endDate: fromDateInput(v, true) })}
            />
          </div>
        </>
      )}

      {fields.includes('team') && (
        <div className="w-full sm:w-48">
          <Select
            label="Team"
            value={filters.teamId ?? ''}
            onChange={(e) => update({ teamId: e.target.value || undefined })}
            options={[{ label: 'All Teams', value: '' }, ...(teamsQuery.data ?? []).map((t) => ({ label: t.name ?? '', value: t.id }))]}
          />
        </div>
      )}

      {fields.includes('leader') && (
        <div className="w-full sm:w-48">
          <Select
            label="Leader"
            value={filters.leaderUserId ?? ''}
            onChange={(e) => update({ leaderUserId: e.target.value || undefined })}
            options={[{ label: 'All Leaders', value: '' }, ...(usersQuery.data ?? []).map((u) => ({ label: userLabel(u), value: u.id }))]}
          />
        </div>
      )}

      {fields.includes('worker') && (
        <div className="w-full sm:w-48">
          <Select
            label="Worker"
            value={filters.workerUserId ?? ''}
            onChange={(e) => update({ workerUserId: e.target.value || undefined })}
            options={[{ label: 'All Workers', value: '' }, ...(usersQuery.data ?? []).map((u) => ({ label: userLabel(u), value: u.id }))]}
          />
        </div>
      )}

      {fields.includes('department') && (
        <div className="w-full sm:w-48">
          <Select
            label="Department"
            value={filters.departmentId ?? ''}
            onChange={(e) => update({ departmentId: e.target.value || undefined })}
            options={[
              { label: 'All Departments', value: '' },
              ...(departmentsQuery.data ?? []).map((d) => ({ label: d.name ?? '', value: d.id })),
            ]}
          />
        </div>
      )}

      {fields.includes('fellowshipGroup') && (
        <div className="w-full sm:w-48">
          <Select
            label="Cell Group"
            value={filters.fellowshipGroupId ?? ''}
            onChange={(e) => update({ fellowshipGroupId: e.target.value || undefined })}
            options={[
              { label: 'All Groups', value: '' },
              ...(fellowshipGroupsQuery.data ?? []).map((g) => ({ label: g.name ?? '', value: g.id })),
            ]}
          />
        </div>
      )}

      {fields.includes('status') && (
        <div className="w-full sm:w-48">
          <Select
            label="Status"
            value={filters.status ?? ''}
            onChange={(e) => update({ status: e.target.value || undefined })}
            options={[{ label: 'All Statuses', value: '' }, ...FOLLOW_UP_STATUS.map((s) => ({ label: s.label, value: s.value }))]}
          />
        </div>
      )}

      {fields.includes('priority') && (
        <div className="w-full sm:w-44">
          <Select
            label="Priority"
            value={filters.priority ?? ''}
            onChange={(e) => update({ priority: e.target.value || undefined })}
            options={[{ label: 'All Priorities', value: '' }, ...TASK_PRIORITY.map((p) => ({ label: p.label, value: p.value }))]}
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={onGenerate} isLoading={isLoading}>
          Generate Report
        </Button>
        <Button leftIcon={<Download className="h-4 w-4" />} onClick={onExport} disabled={exportDisabled}>
          Export CSV
        </Button>
      </div>
    </div>
  );
}
