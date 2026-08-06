import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MessageSquare,
  UserCog,
} from 'lucide-react';
import type { FollowUpTask, Outcome, TaskPriority } from '@/types/followUp';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { TaskFilters, type TaskFiltersState } from '../components/TaskFilters';
import { FollowUpTaskCard } from '../components/FollowUpTaskCard';
import { InteractionForm } from '../components/InteractionForm';
import { CallGuidePanel } from '../components/CallGuidePanel';
import { ReassignTaskModal } from '../components/ReassignTaskModal';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { followUpTasksApi } from '../api/follow-up-tasks.api';
import { formatDate, formatMemberName } from '@/lib/formatters';
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_BADGE,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_BADGE,
  TASK_COLOR_DOT,
  TASK_COLOR_LABEL,
  isTaskOpen,
  isTaskOverdue,
  isTaskDueToday,
} from '../lib/taskDisplay';

export function MyFollowUpsPage() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { user } = useAuth();
  // The route only requires follow_ups.view or follow_ups.view_own; logging
  // an interaction and reassigning a task are separately-permissioned actions
  // (reassign in particular is typically Team Lead/Administrator only).
  const canRecordInteraction = usePermission('follow_ups.record_interaction');
  const canReassign = usePermission('follow_ups.reassign');
  const [filters, setFilters] = useState<TaskFiltersState>({
    statusTab: 'all',
    priority: '',
    sortBy: 'dueDate',
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [presetOutcome, setPresetOutcome] = useState<Outcome | ''>('');
  const [reassignTaskId, setReassignTaskId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['follow-up-tasks', 'mine', user?.id],
    queryFn: () =>
      followUpTasksApi
        .getTasks({ assignedUserId: user!.id, pageSize: 200 })
        .then((r) => r.data),
    enabled: !!user?.id,
  });

  const tasks = useMemo(() => data?.data ?? [], [data]);

  const filteredTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      switch (filters.statusTab) {
        case 'due_today':
          return isTaskOpen(task.status) && isTaskDueToday(task.dueAt);
        case 'overdue':
          return isTaskOverdue(task.dueAt, task.status);
        case 'upcoming':
          return isTaskOpen(task.status) && new Date(task.dueAt) > new Date() && !isTaskDueToday(task.dueAt);
        case 'ESCALATED':
          return task.status === 'ESCALATED';
        case 'COMPLETED':
          return task.status === 'COMPLETED';
        default:
          return true;
      }
    });

    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }

    result = [...result].sort((a, b) => {
      if (filters.sortBy === 'dueDate') {
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      }
      if (filters.sortBy === 'priority') {
        const order: Record<TaskPriority, number> = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
        return order[a.priority] - order[b.priority];
      }
      if (filters.sortBy === 'memberName') {
        return formatMemberName(a.member).localeCompare(formatMemberName(b.member));
      }
      return 0;
    });

    return result;
  }, [tasks, filters]);

  const dueTodayCount = useMemo(
    () => tasks.filter((t) => isTaskOpen(t.status) && isTaskDueToday(t.dueAt)).length,
    [tasks],
  );
  const overdueCount = useMemo(
    () => tasks.filter((t) => isTaskOverdue(t.dueAt, t.status)).length,
    [tasks],
  );
  const completedThisWeekCount = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return tasks.filter((t) => t.status === 'COMPLETED' && t.completedAt && new Date(t.completedAt) >= weekAgo)
      .length;
  }, [tasks]);

  const handleLogInteraction = (taskId: string) => {
    setSelectedTaskId(taskId);
    setPresetOutcome('');
    setShowInteractionModal(true);
  };

  const handleCloseModal = () => {
    setShowInteractionModal(false);
    setSelectedTaskId(null);
    setPresetOutcome('');
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const reassignTask = tasks.find((t) => t.id === reassignTaskId) ?? null;

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

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-rose-600">
            Failed to load your follow-up tasks. Please try again.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (
        <>
          {/* Task List */}
          {isDesktop ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Task Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Interactions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${TASK_COLOR_DOT[task.color]}`}
                          title={TASK_COLOR_LABEL[task.color]}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {formatMemberName(task.member)}
                      </TableCell>
                      <TableCell>
                        {task.member.phonePrimary ? (
                          <span className="inline-flex items-center gap-1.5 text-slate-600">
                            <Phone className="h-3.5 w-3.5" />
                            {task.member.phonePrimary}
                          </span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={TASK_STATUS_BADGE[task.status]} dot>
                          {TASK_STATUS_LABELS[task.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={TASK_PRIORITY_BADGE[task.priority]}>
                          {TASK_PRIORITY_LABELS[task.priority]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={isTaskOverdue(task.dueAt, task.status) ? 'font-medium text-rose-600' : ''}>
                          {formatDate(task.dueAt)}
                        </span>
                      </TableCell>
                      <TableCell>{task._count?.interactions ?? 0}</TableCell>
                      <TableCell>
                        {isTaskOpen(task.status) && (
                          <div className="flex items-center gap-2">
                            {canRecordInteraction && (
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<MessageSquare className="h-3.5 w-3.5" />}
                                onClick={() => handleLogInteraction(task.id)}
                              >
                                Log Interaction
                              </Button>
                            )}
                            {canReassign && (
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<UserCog className="h-3.5 w-3.5" />}
                                onClick={() => setReassignTaskId(task.id)}
                              >
                                Reassign
                              </Button>
                            )}
                          </div>
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
                  onLogInteraction={canRecordInteraction ? () => handleLogInteraction(task.id) : undefined}
                  onReassign={canReassign ? () => setReassignTaskId(task.id) : undefined}
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
        </>
      )}

      {/* Interaction Modal */}
      <Modal
        isOpen={showInteractionModal}
        onClose={handleCloseModal}
        title={selectedTask ? `Log Interaction - ${formatMemberName(selectedTask.member)}` : 'Log Interaction'}
        size={selectedTask?.callGuideId ? 'xl' : 'md'}
      >
        {selectedTaskId && selectedTask && (
          <div className={selectedTask.callGuideId ? 'grid grid-cols-1 gap-6 md:grid-cols-2' : ''}>
            {selectedTask.callGuideId && (
              <CallGuidePanel
                callGuideId={selectedTask.callGuideId}
                memberName={formatMemberName(selectedTask.member)}
                workerName={user ? formatMemberName(user) : ''}
                onOutcomeSelect={setPresetOutcome}
              />
            )}
            <InteractionForm
              taskId={selectedTaskId}
              onSuccess={handleCloseModal}
              onCancel={handleCloseModal}
              presetOutcome={presetOutcome}
            />
          </div>
        )}
      </Modal>

      <ReassignTaskModal
        isOpen={reassignTaskId !== null}
        onClose={() => setReassignTaskId(null)}
        task={reassignTask}
      />
    </div>
  );
}
