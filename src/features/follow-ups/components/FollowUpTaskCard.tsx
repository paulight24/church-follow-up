import { useState } from 'react';
import { Phone, CheckCircle, Clock, User } from 'lucide-react';
import type { FollowUpTask } from '@/types/followUp';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/cn';
import { formatDate, formatRelativeDate, formatPhone, formatMemberName } from '@/lib/formatters';
import { FOLLOW_UP_STATUS, TASK_PRIORITY } from '@/lib/constants';

interface FollowUpTaskCardProps {
  task: FollowUpTask;
  onLogCall?: (task: FollowUpTask) => void;
  onMarkComplete?: (task: FollowUpTask) => void;
}

const priorityBorderColors: Record<string, string> = {
  URGENT: 'border-l-rose-500',
  HIGH: 'border-l-amber-500',
  MEDIUM: 'border-l-sky-500',
  LOW: 'border-l-slate-400',
};

const statusBadgeVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  MISSED: 'danger',
  ESCALATED: 'warning',
};

const priorityBadgeVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
  URGENT: 'danger',
  HIGH: 'warning',
  MEDIUM: 'info',
  LOW: 'gray',
};

function getDueDateColor(dueDate: string): string {
  const now = new Date();
  const due = new Date(dueDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  if (dueDay < today) return 'text-rose-600';
  if (dueDay.getTime() === today.getTime()) return 'text-amber-600';
  return 'text-emerald-600';
}

function getStatusLabel(status: string): string {
  return FOLLOW_UP_STATUS.find((s) => s.value === status)?.label ?? status;
}

function getPriorityLabel(priority: string): string {
  return TASK_PRIORITY.find((p) => p.value === priority)?.label ?? priority;
}

export function FollowUpTaskCard({ task, onLogCall, onMarkComplete }: FollowUpTaskCardProps) {
  const memberName = formatMemberName(task.member);
  const isCompleted = task.status === 'COMPLETED';

  return (
    <Card
      className={cn(
        'border-l-4 transition-shadow hover:shadow-md',
        priorityBorderColors[task.priority] ?? 'border-l-slate-300',
      )}
    >
      <CardContent className="pt-4">
        {/* Member header */}
        <div className="flex items-start gap-3">
          <Avatar name={memberName} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {memberName}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant={statusBadgeVariants[task.status]} size="sm" dot>
                {getStatusLabel(task.status)}
              </Badge>
              <Badge variant={priorityBadgeVariants[task.priority]} size="sm">
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 space-y-2 text-sm">
          {/* Due date */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="text-slate-500">Due:</span>
            <span className={cn('font-medium', getDueDateColor(task.dueDate))}>
              {formatDate(task.dueDate)}
            </span>
          </div>

          {/* Phone */}
          {task.member.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
              <a
                href={`tel:${task.member.phone}`}
                className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                {formatPhone(task.member.phone)}
              </a>
            </div>
          )}

          {/* Assigned to */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="text-slate-500">Assigned to:</span>
            <span className="text-slate-700">
              {formatMemberName(task.assignedTo)}
            </span>
          </div>

          {/* Last attempt */}
          <div className="flex items-center justify-between text-slate-500">
            <span>
              Attempts: <span className="font-medium text-slate-700">{task.attemptCount}</span>
            </span>
            {task.lastAttemptDate && (
              <span className="text-xs">
                Last: {formatRelativeDate(task.lastAttemptDate)}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      {/* Actions */}
      {!isCompleted && (
        <CardFooter className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Phone className="h-4 w-4" />}
            onClick={() => onLogCall?.(task)}
          >
            Log Call
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<CheckCircle className="h-4 w-4" />}
            onClick={() => onMarkComplete?.(task)}
          >
            Mark Complete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
