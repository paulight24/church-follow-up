import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import type { MemberListFilters } from '@/types/member';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { lookupsApi } from '@/features/members/api/lookups.api';

interface MemberFiltersProps {
  filters: MemberListFilters;
  onFilterChange: (filters: MemberListFilters) => void;
}

const genderOptions = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
];

const firstTimerOptions = [
  { label: 'First timers only', value: 'true' },
  { label: 'Not first timers', value: 'false' },
];

const visitorJourneyStageOptions = [
  { label: 'New First Timer', value: 'NEW_FIRST_TIMER' },
  { label: 'Contact Attempted', value: 'CONTACT_ATTEMPTED' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'Returning Visitor', value: 'RETURNING_VISITOR' },
  { label: 'Foundation School Invited', value: 'FOUNDATION_SCHOOL_INVITED' },
  { label: 'Foundation School Enrolled', value: 'FOUNDATION_SCHOOL_ENROLLED' },
  { label: 'Foundation School In Progress', value: 'FOUNDATION_SCHOOL_IN_PROGRESS' },
  { label: 'Graduated', value: 'GRADUATED' },
  { label: 'Assigned To Cell', value: 'ASSIGNED_TO_CELL' },
  { label: 'Established Member', value: 'ESTABLISHED_MEMBER' },
];

export function MemberFilters({ filters, onFilterChange }: MemberFiltersProps) {
  const { data: departments } = useQuery({
    queryKey: ['departments', 'lookup'],
    queryFn: () => lookupsApi.getDepartments().then((res) => res.data.data),
  });

  const { data: fellowshipGroups } = useQuery({
    queryKey: ['fellowship-groups', 'lookup'],
    queryFn: () => lookupsApi.getFellowshipGroups().then((res) => res.data.data),
  });

  const departmentOptions = (departments ?? []).map((d) => ({ label: d.name, value: d.id }));
  const fellowshipGroupOptions = (fellowshipGroups ?? []).map((g) => ({ label: g.name, value: g.id }));

  const hasActiveFilters =
    filters.gender != null ||
    filters.departmentId != null ||
    filters.fellowshipGroupId != null ||
    filters.isFirstTimer != null ||
    filters.visitorJourneyStage != null ||
    filters.includeArchived === true;

  const handleClearFilters = () => {
    onFilterChange({
      ...filters,
      gender: undefined,
      departmentId: undefined,
      fellowshipGroupId: undefined,
      isFirstTimer: undefined,
      visitorJourneyStage: undefined,
      includeArchived: undefined,
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-full sm:w-36">
        <Select
          label="Gender"
          placeholder="All genders"
          options={genderOptions}
          value={filters.gender ?? ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              gender: e.target.value ? (e.target.value as MemberListFilters['gender']) : undefined,
              page: 1,
            })
          }
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          label="Department"
          placeholder="All departments"
          options={departmentOptions}
          value={filters.departmentId ?? ''}
          onChange={(e) =>
            onFilterChange({ ...filters, departmentId: e.target.value || undefined, page: 1 })
          }
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          label="Cell Group"
          placeholder="All groups"
          options={fellowshipGroupOptions}
          value={filters.fellowshipGroupId ?? ''}
          onChange={(e) =>
            onFilterChange({ ...filters, fellowshipGroupId: e.target.value || undefined, page: 1 })
          }
        />
      </div>

      <div className="w-full sm:w-52">
        <Select
          label="Visitor Journey Stage"
          placeholder="Any stage"
          options={visitorJourneyStageOptions}
          value={filters.visitorJourneyStage ?? ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              visitorJourneyStage: e.target.value
                ? (e.target.value as MemberListFilters['visitorJourneyStage'])
                : undefined,
              page: 1,
            })
          }
        />
      </div>

      <div className="w-full sm:w-44">
        <Select
          label="First Timer"
          placeholder="All members"
          options={firstTimerOptions}
          value={filters.isFirstTimer != null ? String(filters.isFirstTimer) : ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              isFirstTimer: e.target.value ? e.target.value === 'true' : undefined,
              page: 1,
            })
          }
        />
      </div>

      <label className="flex h-10 w-full items-center gap-2 text-sm text-slate-600 sm:w-auto">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          checked={filters.includeArchived === true}
          onChange={(e) =>
            onFilterChange({ ...filters, includeArchived: e.target.checked || undefined, page: 1 })
          }
        />
        Include archived
      </label>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          leftIcon={<X className="h-4 w-4" />}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
