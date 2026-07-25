import { X } from 'lucide-react';
import type { MemberFilters as MemberFiltersType } from '@/types/member';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MEMBER_STATUS } from '@/lib/constants';

interface MemberFiltersProps {
  filters: MemberFiltersType;
  onFilterChange: (filters: MemberFiltersType) => void;
}

const statusOptions = MEMBER_STATUS.map((s) => ({
  label: s.label,
  value: s.value,
}));

const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

const activeOptions = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];

export function MemberFilters({ filters, onFilterChange }: MemberFiltersProps) {
  const hasActiveFilters =
    filters.status != null ||
    filters.gender != null ||
    (filters.department != null && filters.department !== '') ||
    filters.isActive != null;

  const handleClearFilters = () => {
    onFilterChange({
      ...filters,
      status: undefined,
      gender: undefined,
      department: undefined,
      isActive: undefined,
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-full sm:w-40">
        <Select
          label="Status"
          placeholder="All statuses"
          options={statusOptions}
          value={filters.status ?? ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              status: e.target.value ? (e.target.value as MemberFiltersType['status']) : undefined,
              page: 1,
            })
          }
        />
      </div>

      <div className="w-full sm:w-36">
        <Select
          label="Gender"
          placeholder="All genders"
          options={genderOptions}
          value={filters.gender ?? ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              gender: e.target.value ? (e.target.value as MemberFiltersType['gender']) : undefined,
              page: 1,
            })
          }
        />
      </div>

      <div className="w-full sm:w-44">
        <Input
          label="Department"
          placeholder="Filter by department"
          value={filters.department ?? ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              department: e.target.value || undefined,
              page: 1,
            })
          }
        />
      </div>

      <div className="w-full sm:w-36">
        <Select
          label="Active Status"
          placeholder="All"
          options={activeOptions}
          value={filters.isActive != null ? String(filters.isActive) : ''}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              isActive: e.target.value ? e.target.value === 'true' : undefined,
              page: 1,
            })
          }
        />
      </div>

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
