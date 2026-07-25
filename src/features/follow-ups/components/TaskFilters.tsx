import { Select } from '@/components/ui/Select';
import { Tabs, TabList, Tab } from '@/components/ui/Tabs';

export interface TaskFiltersState {
  statusTab: string;
  priority: string;
  sortBy: string;
}

interface TaskFiltersProps {
  filters: TaskFiltersState;
  onFilterChange: (filters: TaskFiltersState) => void;
}

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Due Today', value: 'due_today' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Escalated', value: 'ESCALATED' },
  { label: 'Completed', value: 'COMPLETED' },
] as const;

const priorityOptions = [
  { label: 'All Priorities', value: '' },
  { label: 'Low', value: 'LOW' },
  { label: 'Normal', value: 'NORMAL' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];

const sortOptions = [
  { label: 'Due Date', value: 'dueDate' },
  { label: 'Priority', value: 'priority' },
  { label: 'Member Name', value: 'memberName' },
];

export function TaskFilters({ filters, onFilterChange }: TaskFiltersProps) {
  return (
    <div className="space-y-4">
      <Tabs
        value={filters.statusTab}
        onValueChange={(statusTab) => onFilterChange({ ...filters, statusTab })}
      >
        <TabList className="overflow-x-auto">
          {statusTabs.map((tab) => (
            <Tab key={tab.value} value={tab.value}>
              {tab.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-44">
          <Select
            label="Priority"
            options={priorityOptions}
            value={filters.priority}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            label="Sort by"
            options={sortOptions}
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
