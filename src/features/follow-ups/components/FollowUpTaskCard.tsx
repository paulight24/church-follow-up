import { Phone, MessageSquare, Clock, User } from 'lucide-react';
import type { FollowUpTask } from '@/types/followUp';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/cn';
import { formatDate, formatMemberName } from '@/lib/formatters';
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_BADGE,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_BADGE,
  TASK_COLOR_DOT,
  TASK_COLOR_LABEL,
  isTaskOverdue,
  isTaskOpen,
} from '../lib/taskDisplay';

interface FollowUpTaskCardProps {
  task: FollowUpTask;
  onLogInteraction?: (task: FollowUpTask) => void;
}

function getDueDateColor(task: FollowUpTask): string {
  if (isTaskOverdue(task.dueAt, task.status)) return 'text-rose-600';
  return 'text-slate-700';
}

export function FollowUpTaskCard({ task, onLogInteraction }: FollowUpTaskCardProps) {
  const memberName = formatMemberName(task.member);
  const canLogInteraction = isTaskOpen(task.status);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <span
            className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', TASK_COLOR_DOT[task.color])}
            title={TASK_COLOR_LABEL[task.color]}
          />
          <Avatar name={memberName} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-slate-900">{memberName}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant={TASK_STATUS_BADGE[task.status]} size="sm" dot>
                {TASK_STATUS_LABELS[task.status]}
              </Badge>
              <Badge variant={TASK_PRIORITY_BADGE[task.priority]} size="sm">
                {TASK_PRIORITY_LABELS[task.priority]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="text-slate-500">Due:</span>
            <span className={cn('font-medium', getDueDateColor(task))}>{formatDate(task.dueAt)}</span>
          </div>

          {task.member.phonePrimary && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
              <a
                href={`tel:${task.member.phonePrimary}`}
                className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                {task.member.phonePrimary}
              </a>
            </div>
          )}

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="text-slate-500">Assigned to:</span>
            <span className="text-slate-700">
              {task.assignedUser ? formatMemberName(task.assignedUser) : 'Unassigned'}
            </span>
          </div>

          {task._count && (
            <div className="text-slate-500">
              Interactions: <span className="font-medium text-slate-700">{task._count.interactions}</span>
            </div>
          )}
        </div>
      </CardContent>

      {canLogInteraction && (
        <CardFooter className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<MessageSquare className="h-4 w-4" />}
            onClick={() => onLogInteraction?.(task)}
          >
            Log Interaction
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
