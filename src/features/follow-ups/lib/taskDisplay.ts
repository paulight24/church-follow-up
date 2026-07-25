import type { TaskColor, TaskPriority, TaskStatus, Channel, Outcome } from '@/types/followUp';

// Local display helpers for the new follow-up-task field names/enums. Kept
// inside this feature because `src/lib/constants.ts` and
// `src/components/ui/StatusBadge.tsx` are still wired to the old flat
// FollowUp model's status values and are out of scope to change here.

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'purple';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  CONTACTED: 'Contacted',
  FOLLOW_UP_REQUIRED: 'Follow-Up Required',
  COMPLETED: 'Completed',
  NO_ANSWER: 'No Answer',
  WRONG_CONTACT: 'Wrong Contact',
  DO_NOT_CONTACT: 'Do Not Contact',
  ESCALATED: 'Escalated',
  CANCELLED: 'Cancelled',
};

export const TASK_STATUS_BADGE: Record<TaskStatus, BadgeVariant> = {
  NOT_STARTED: 'gray',
  IN_PROGRESS: 'info',
  CONTACTED: 'info',
  FOLLOW_UP_REQUIRED: 'warning',
  COMPLETED: 'success',
  NO_ANSWER: 'warning',
  WRONG_CONTACT: 'danger',
  DO_NOT_CONTACT: 'gray',
  ESCALATED: 'purple',
  CANCELLED: 'gray',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  NORMAL: 'Normal',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const TASK_PRIORITY_BADGE: Record<TaskPriority, BadgeVariant> = {
  LOW: 'gray',
  NORMAL: 'info',
  HIGH: 'warning',
  URGENT: 'danger',
};

/** GREEN/YELLOW/RED/PURPLE/GRAY - computed by the backend per task. */
export const TASK_COLOR_DOT: Record<TaskColor, string> = {
  GREEN: 'bg-emerald-500',
  YELLOW: 'bg-amber-500',
  RED: 'bg-rose-500',
  PURPLE: 'bg-purple-500',
  GRAY: 'bg-slate-400',
};

export const TASK_COLOR_LABEL: Record<TaskColor, string> = {
  GREEN: 'On track',
  YELLOW: 'Needs attention',
  RED: 'Overdue',
  PURPLE: 'Escalated',
  GRAY: 'Inactive',
};

export const REASON_CODE_LABELS: Record<string, string> = {
  NEW_VISITOR: 'New Visitor',
  ABSENT: 'Absent',
  PRAYER_REQUEST: 'Prayer Request',
  PASTORAL_REQUEST: 'Pastoral Request',
  CAMPAIGN_RESPONSE: 'Campaign Response',
  IMPORT: 'Import',
  API: 'API',
  MANUAL: 'Manual',
};

export const CHANNEL_OPTIONS: { label: string; value: Channel }[] = [
  { label: 'Phone Call', value: 'CALL' },
  { label: 'SMS', value: 'SMS' },
  { label: 'WhatsApp', value: 'WHATSAPP' },
  { label: 'Email', value: 'EMAIL' },
  { label: 'Visit', value: 'VISIT' },
  { label: 'Card', value: 'CARD' },
];

export const OUTCOME_OPTIONS: { label: string; value: Outcome }[] = [
  { label: 'Successful', value: 'SUCCESSFUL' },
  { label: 'No Answer', value: 'NO_ANSWER' },
  { label: 'Wrong Number', value: 'WRONG_NUMBER' },
  { label: 'Declined', value: 'DECLINED' },
  { label: 'Voicemail', value: 'VOICEMAIL' },
  { label: 'Busy', value: 'BUSY' },
  { label: 'Scheduled Callback', value: 'SCHEDULED_CALLBACK' },
  { label: 'Will Attend', value: 'WILL_ATTEND' },
  { label: "Won't Attend", value: 'WONT_ATTEND' },
  { label: 'Needs Prayer', value: 'NEEDS_PRAYER' },
  { label: 'Needs Pastoral Care', value: 'NEEDS_PASTORAL_CARE' },
  { label: 'Do Not Contact', value: 'DO_NOT_CONTACT' },
  { label: 'Other', value: 'OTHER' },
];

export function isTaskOpen(status: TaskStatus): boolean {
  return !['COMPLETED', 'CANCELLED', 'DO_NOT_CONTACT'].includes(status);
}

export function isTaskOverdue(dueAt: string, status: TaskStatus): boolean {
  if (!isTaskOpen(status)) return false;
  return new Date(dueAt).getTime() < Date.now();
}

export function isTaskDueToday(dueAt: string): boolean {
  const due = new Date(dueAt);
  const today = new Date();
  return (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth() &&
    due.getDate() === today.getDate()
  );
}
