import { Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const overdueTasks = [
  {
    id: '1',
    member: 'Grace Okafor',
    assignedTo: 'Mary Johnson',
    dueDate: '2026-07-18',
    daysOverdue: 7,
    priority: 'HIGH' as const,
  },
  {
    id: '2',
    member: 'David Chen',
    assignedTo: 'Pastor James',
    dueDate: '2026-07-20',
    daysOverdue: 5,
    priority: 'URGENT' as const,
  },
  {
    id: '3',
    member: 'Sarah Williams',
    assignedTo: 'Ruth Adeyemi',
    dueDate: '2026-07-21',
    daysOverdue: 4,
    priority: 'MEDIUM' as const,
  },
  {
    id: '4',
    member: 'Michael Brown',
    assignedTo: 'John Osei',
    dueDate: '2026-07-22',
    daysOverdue: 3,
    priority: 'HIGH' as const,
  },
  {
    id: '5',
    member: 'Angela Davis',
    assignedTo: 'Mary Johnson',
    dueDate: '2026-07-23',
    daysOverdue: 2,
    priority: 'LOW' as const,
  },
  {
    id: '6',
    member: 'Emmanuel Kalu',
    assignedTo: 'Pastor James',
    dueDate: '2026-07-24',
    daysOverdue: 1,
    priority: 'MEDIUM' as const,
  },
];

const priorityVariants: Record<string, 'gray' | 'warning' | 'danger' | 'default'> = {
  LOW: 'gray',
  MEDIUM: 'warning',
  HIGH: 'warning',
  URGENT: 'danger',
};

export function OverdueTasksTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overdue Follow-Up Tasks</CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Days Overdue</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overdueTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium text-slate-900">
                  {task.member}
                </TableCell>
                <TableCell>{task.assignedTo}</TableCell>
                <TableCell className="text-slate-500">
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-rose-600">
                    {task.daysOverdue} {task.daysOverdue === 1 ? 'day' : 'days'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={priorityVariants[task.priority] ?? 'gray'}
                    size="sm"
                    dot
                  >
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Eye className="h-3.5 w-3.5" />}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
