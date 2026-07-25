import { useState } from 'react';
import type { FollowUpTask, TaskStatus, TaskPriority } from '@/types/followUp';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { TaskFilters } from '../components/TaskFilters';
import { FollowUpTaskCard } from '../components/FollowUpTaskCard';
import { InteractionForm } from '../components/InteractionForm';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { formatDate, formatRelativeDate, formatPhone, formatMemberName } from '@/lib/formatters';
import { TASK_PRIORITY } from '@/lib/constants';
import {
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MessageSquare,
} from 'lucide-react';

const MOCK_TASKS: FollowUpTask[] = [
  {
    id: '1',
    cycleId: 'c1',
    memberId: 'm1',
    member: { id: 'm1', firstName: 'Adebayo', lastName: 'Ogundimu', phone: '+2348012345678', email: 'adebayo.o@gmail.com' },
    assignedToId: 'w1',
    assignedTo: { id: 'w1', firstName: 'Grace', lastName: 'Adeyemi' },
    status: 'PENDING',
    priority: 'HIGH',
    dueDate: '2026-07-25T00:00:00Z',
    notes: 'First-time visitor from Sunday service',
    attemptCount: 0,
    lastAttemptDate: null,
    completedDate: null,
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-20T10:00:00Z',
  },
  {
    id: '2',
    cycleId: 'c1',
    memberId: 'm2',
    member: { id: 'm2', firstName: 'Chioma', lastName: 'Okonkwo', phone: '+2349087654321', email: 'chioma.ok@yahoo.com' },
    assignedToId: 'w1',
    assignedTo: { id: 'w1', firstName: 'Grace', lastName: 'Adeyemi' },
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: '2026-07-24T00:00:00Z',
    notes: 'Missed two consecutive Sundays',
    attemptCount: 1,
    lastAttemptDate: '2026-07-22T14:30:00Z',
    completedDate: null,
    createdAt: '2026-07-18T08:00:00Z',
    updatedAt: '2026-07-22T14:30:00Z',
  },
  {
    id: '3',
    cycleId: 'c1',
    memberId: 'm3',
    member: { id: 'm3', firstName: 'Emeka', lastName: 'Eze', phone: '+2348023456789', email: null },
    assignedToId: 'w1',
    assignedTo: { id: 'w1', firstName: 'Grace', lastName: 'Adeyemi' },
    status: 'COMPLETED',
    priority: 'LOW',
    dueDate: '2026-07-20T00:00:00Z',
    notes: 'New member welcome call completed',
    attemptCount: 2,
    lastAttemptDate: '2026-07-20T11:00:00Z',
    completedDate: '2026-07-20T11:00:00Z',
    createdAt: '2026-07-15T09:00:00Z',
    updatedAt: '2026-07-20T11:00:00Z',
  },
  {
    id: '4',
    cycleId: 'c1',
    memberId: 'm4',
    member: { id: 'm4', firstName: 'Ngozi', lastName: 'Nwosu', phone: '+2349034567890', email: 'ngozi.nwosu@hotmail.com' },
    assignedToId: 'w1',
    assignedTo: { id: 'w1', firstName: 'Grace', lastName: 'Adeyemi' },
    status: 'MISSED',
    priority: 'URGENT',
    dueDate: '2026-07-22T00:00:00Z',
    notes: 'Reported going through a difficult time',
    attemptCount: 3,
    lastAttemptDate: '2026-07-23T09:15:00Z',
    completedDate: null,
    createdAt: '2026-07-16T10:00:00Z',
    updatedAt: '2026-07-23T09:15:00Z',
  },
  {
    id: '5',
    cycleId: 'c2',
    memberId: 'm5',
    member: { id: 'm5', firstName: 'Oluwaseun', lastName: 'Okafor', phone: '+2348045678901', email: 'seun.okafor@gmail.com' },
    assignedToId: 'w1',
    assignedTo: { id: 'w1', firstName: 'Grace', lastName: 'Adeyemi' },
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: '2026-07-26T00:00:00Z',
    notes: 'Second-time visitor, expressed interest in Bible study',
    attemptCount: 0,
    lastAttemptDate: null,
    completedDate: null,
    createdAt: '2026-07-21T08:00:00Z',
    updatedAt: '2026-07-21T08:00:00Z',
  },
  {
    id: '6',
    cycleId: 'c2',
    memberId: 'm6',
    member: { id: 'm6', firstName: 'Fatima', lastName: 'Abdullahi', phone: '+2348056789012', email: null },
    assignedToId: 'w1',
    assignedTo: { id: 'w1', firstName: 'Grace', lastName: 'Adeyemi' },
    status: 'ESCALATED',
    priority: 'HIGH',
    dueDate: '2026-07-23T00:00:00Z',
    notes: 'Needs pastoral counseling - family crisis',
    attemptCount: 2,
    lastAttemptDate: '2026-07-24T16:00:00Z',
    completedDate: null,
    createdAt: '2026-07-17T11:00:00Z',
    updatedAt: '2026-07-24T16:00:00Z',
  },
  {
    id: '7',
    cycleId: 'c2',
    memberId: 'm7',
    member: { id: 'm7', firstName: 'Tunde', lastName: 'Afolabi', phone: '+2349067890123', email: 'tunde.a@gmail.com' },
    assignedToId: 'w1',
    assignedTo: { id: 'w1', firstName: 'Grace', lastName: 'Adeyemi' },
    status: 'COMPLETED',
    priority: 'LOW',
    dueDate: '2026-07-21T00:00:00Z',
    notes: 'Reconnected after three months away',
    attemptCount: 1,
    lastAttemptDate: '2026-07-21T10:00:00Z',
    completedDate: '2026-07-21T10:00:00Z',
    createdAt: '2026-07-14T09:00:00Z',
    updatedAt: '2026-07-21T10:00:00Z',
  },
  {
    id: '8',
    cycleId: 'c2',
    memberId: 'm8',
    member: { id: 'm8', firstName: 'Blessing', lastName: 'Igwe', phone: '+2348078901234', email: 'blessing.igwe@outlook.com' },
    assignedToId: 'w1',
    assignedTo: { id: 'w1', firstName: 'Grace', lastName: 'Adeyemi' },
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-07-25T00:00:00Z',
    notes: 'New convert, needs foundation class enrollment',
    attemptCount: 1,
    lastAttemptDate: '2026-07-24T08:45:00Z',
    completedDate: null,
    createdAt: '2026-07-19T12:00:00Z',
    updatedAt: '2026-07-24T08:45:00Z',
  },
  {
    id: '9',
    cycleId: 'c1',
    memberId: 'm9',
    member: { id: 'm9', firstName: 'Ifeanyi', lastName: 'Okeke', phone: '+2349089012345', email: null },
    assignedToId: 'w1',
    assignedTo: { id: 'w1', firstName: 'Grace', lastName: 'Adeyemi' },
    status: 'PENDING',
    priority: 'LOW',
    dueDate: '2026-07-28T00:00:00Z',
    notes: 'Birthday follow-up and welfare check',
    attemptCount: 0,
    lastAttemptDate: null,
    completedDate: null,
    createdAt: '2026-07-22T07:00:00Z',
    updatedAt: '2026-07-22T07:00:00Z',
  },
];

function getPriorityBadgeVariant(priority: TaskPriority) {
  const map: Record<TaskPriority, 'gray' | 'warning' | 'danger' | 'purple'> = {
    LOW: 'gray',
    MEDIUM: 'warning',
    HIGH: 'danger',
    URGENT: 'purple',
  };
  return map[priority];
}

function getPriorityLabel(priority: TaskPriority): string {
  return TASK_PRIORITY.find((p) => p.value === priority)?.label ?? priority;
}

function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isOverdue(task: FollowUpTask): boolean {
  if (task.status === 'COMPLETED') return false;
  return new Date(task.dueDate) < new Date() && !isToday(task.dueDate);
}

function isUpcoming(task: FollowUpTask): boolean {
  if (task.status === 'COMPLETED') return false;
  return new Date(task.dueDate) > new Date();
}

export function MyFollowUpsPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: '',
    sortBy: 'dueDate',
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showInteractionModal, setShowInteractionModal] = useState(false);

  const filteredTasks = MOCK_TASKS.filter((task) => {
    if (filters.status === 'due_today' && !isToday(task.dueDate)) return false;
    if (filters.status === 'overdue' && !isOverdue(task)) return false;
    if (filters.status === 'upcoming' && !isUpcoming(task)) return false;
    if (filters.status === 'completed' && task.status !== 'COMPLETED') return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'dueDate') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (filters.sortBy === 'priority') {
      const order: Record<TaskPriority, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return order[a.priority] - order[b.priority];
    }
    if (filters.sortBy === 'memberName') {
      return formatMemberName(a.member).localeCompare(formatMemberName(b.member));
    }
    return 0;
  });

  const dueTodayCount = MOCK_TASKS.filter((t) => isToday(t.dueDate) && t.status !== 'COMPLETED').length;
  const overdueCount = MOCK_TASKS.filter((t) => isOverdue(t)).length;
  const completedThisWeekCount = MOCK_TASKS.filter((t) => {
    if (t.status !== 'COMPLETED' || !t.completedDate) return false;
    const completed = new Date(t.completedDate);
    const now = new Date();
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    return completed >= weekAgo;
  }).length;

  const handleLogInteraction = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowInteractionModal(true);
  };

  const handleCloseModal = () => {
    setShowInteractionModal(false);
    setSelectedTaskId(null);
  };

  const selectedTask = MOCK_TASKS.find((t) => t.id === selectedTaskId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Follow-Ups"
        subtitle={`${filteredTasks.length} task${filteredTasks.length === 1 ? '' : 's'} assigned to you`}
      />

      <TaskFilters filters={filters} onFilterChange={setFilters} />

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <CalendarClock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900">{dueTodayCount}</p>
              <p className="text-sm text-amber-700">Due Today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-900">{overdueCount}</p>
              <p className="text-sm text-rose-700">Overdue</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-900">{completedThisWeekCount}</p>
              <p className="text-sm text-emerald-700">Completed This Week</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      {isDesktop ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium text-slate-900">
                    {formatMemberName(task.member)}
                  </TableCell>
                  <TableCell>
                    {task.member.phone ? (
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <Phone className="h-3.5 w-3.5" />
                        {formatPhone(task.member.phone)}
                      </span>
                    ) : (
                      <span className="text-slate-400">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} type="followUp" />
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityBadgeVariant(task.priority)}>
                      {getPriorityLabel(task.priority)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={isOverdue(task) ? 'font-medium text-rose-600' : ''}>
                      {formatDate(task.dueDate)}
                    </span>
                  </TableCell>
                  <TableCell>{task.attemptCount}</TableCell>
                  <TableCell>
                    {task.lastAttemptDate ? (
                      formatRelativeDate(task.lastAttemptDate)
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.status !== 'COMPLETED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<MessageSquare className="h-3.5 w-3.5" />}
                        onClick={() => handleLogInteraction(task.id)}
                      >
                        Log Interaction
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <FollowUpTaskCard
              key={task.id}
              task={task}
              onLogInteraction={() => handleLogInteraction(task.id)}
            />
          ))}
        </div>
      )}

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              No follow-up tasks match your current filters.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Interaction Modal */}
      <Modal
        isOpen={showInteractionModal}
        onClose={handleCloseModal}
        title={
          selectedTask
            ? `Log Interaction - ${formatMemberName(selectedTask.member)}`
            : 'Log Interaction'
        }
        size="md"
      >
        {selectedTaskId && (
          <InteractionForm
            taskId={selectedTaskId}
            onSuccess={handleCloseModal}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>
    </div>
  );
}
