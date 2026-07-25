import type { FollowUpCycle } from '@/types/followUp';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { formatDate } from '@/lib/formatters';
import { Plus } from 'lucide-react';

type CycleStatus = 'Active' | 'Completed' | 'Planning';

const statusVariantMap: Record<CycleStatus, 'success' | 'info' | 'warning'> = {
  Active: 'success',
  Completed: 'info',
  Planning: 'warning',
};

const MOCK_CYCLES: (FollowUpCycle & { displayStatus: CycleStatus })[] = [
  {
    id: 'c1',
    name: 'April 2026 New Members',
    description: 'Follow-up for all new members who joined in April 2026',
    startDate: '2026-04-01T00:00:00Z',
    endDate: '2026-04-30T00:00:00Z',
    status: 'Completed',
    displayStatus: 'Completed',
    createdBy: 'Pastor James Obi',
    taskCount: 42,
    completedCount: 38,
    createdAt: '2026-03-28T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'Easter Outreach Follow-Up',
    description: 'Follow-up for Easter evangelism outreach contacts',
    startDate: '2026-04-06T00:00:00Z',
    endDate: '2026-05-15T00:00:00Z',
    status: 'Completed',
    displayStatus: 'Completed',
    createdBy: 'Deacon Chukwu Emeka',
    taskCount: 65,
    completedCount: 65,
    createdAt: '2026-04-07T08:00:00Z',
  },
  {
    id: 'c3',
    name: 'Mid-Year Absentee Care',
    description: 'Reaching out to members absent for 3+ consecutive Sundays',
    startDate: '2026-06-15T00:00:00Z',
    endDate: '2026-08-15T00:00:00Z',
    status: 'Active',
    displayStatus: 'Active',
    createdBy: 'Pastor James Obi',
    taskCount: 28,
    completedCount: 12,
    createdAt: '2026-06-10T09:00:00Z',
  },
  {
    id: 'c4',
    name: 'Q3 First Timers',
    description: 'Welcome and integration follow-up for July-September first-time visitors',
    startDate: '2026-08-01T00:00:00Z',
    endDate: '2026-09-30T00:00:00Z',
    status: 'Planning',
    displayStatus: 'Planning',
    createdBy: 'Sister Grace Adeyemi',
    taskCount: 0,
    completedCount: 0,
    createdAt: '2026-07-20T14:00:00Z',
  },
];

function getProgressPercentage(cycle: FollowUpCycle): number {
  if (cycle.taskCount === 0) return 0;
  return Math.round((cycle.completedCount / cycle.taskCount) * 100);
}

export function FollowUpCyclesPage() {
  const handleRowClick = () => {
    alert('Cycle details coming soon');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-Up Cycles"
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New Cycle
          </Button>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tasks</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_CYCLES.map((cycle) => {
              const progress = getProgressPercentage(cycle);
              return (
                <TableRow
                  key={cycle.id}
                  className="cursor-pointer"
                  onClick={handleRowClick}
                >
                  <TableCell className="font-medium text-slate-900">
                    {cycle.name}
                  </TableCell>
                  <TableCell>{formatDate(cycle.startDate)}</TableCell>
                  <TableCell>{formatDate(cycle.endDate)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[cycle.displayStatus]} dot>
                      {cycle.displayStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{cycle.taskCount}</TableCell>
                  <TableCell>{cycle.completedCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{progress}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
