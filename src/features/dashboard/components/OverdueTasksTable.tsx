import { ClipboardCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/formatters';

export interface OverdueTaskRow {
  id: string;
  memberName: string;
  assignedToName: string;
  dueDate: string;
  priority: string;
}

interface OverdueTasksTableProps {
  title?: string;
  tasks: OverdueTaskRow[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const priorityVariants: Record<string, 'gray' | 'warning' | 'danger' | 'default'> = {
  LOW: 'gray',
  NORMAL: 'default',
  MEDIUM: 'warning',
  HIGH: 'warning',
  URGENT: 'danger',
};

function daysOverdue(dueDate: string): number {
  const diffMs = Date.now() - new Date(dueDate).getTime();
  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function OverdueTasksTable({
  title = 'Overdue Follow-Up Tasks',
  tasks,
  isLoading,
  emptyMessage = 'No overdue follow-up tasks. Great work!',
}: OverdueTasksTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-0">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState icon={ClipboardCheck} title="All caught up" description={emptyMessage} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium text-slate-900">{task.memberName}</TableCell>
                  <TableCell>{task.assignedToName}</TableCell>
                  <TableCell className="text-slate-500">{formatDate(task.dueDate)}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-rose-600">
                      {daysOverdue(task.dueDate)} {daysOverdue(task.dueDate) === 1 ? 'day' : 'days'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityVariants[task.priority] ?? 'gray'} size="sm" dot>
                      {task.priority}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
