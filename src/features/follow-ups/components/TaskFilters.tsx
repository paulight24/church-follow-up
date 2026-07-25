import { Select } from '@/components/ui/Select';
import { Tabs, TabList, Tab } from '@/components/ui/Tabs';
import { TASK_PRIORITY } from '@/lib/constants';

interface TaskFiltersState {
  status: string;
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
  { label: 'Completed', value: 'completed' },
] as const;

const priorityOptions = [
  { label: 'All Priorities', value: '' },
  ...TASK_PRIORITY.map((p) => ({ label: p.label, value: p.value })),
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
        value={filters.status}
        onValueChange={(status) => onFilterChange({ ...filters, status })}
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
            onChange={(e) =>
              onFilterChange({ ...filters, priority: e.target.value })
            }
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            label="Sort by"
            options={sortOptions}
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({ ...filters, sortBy: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}
