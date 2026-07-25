import type { EscalationCategory, EscalationPriority, EscalationStatus } from '@/types/escalation';

// Local display helpers for the pastoral-escalations enums. Kept inside this
// feature because `src/lib/constants.ts` is still wired to the old
// escalation model's category/priority values and is out of scope to change
// here.

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'purple';

export const CATEGORY_OPTIONS: { label: string; value: EscalationCategory }[] = [
  { label: 'Bereavement', value: 'BEREAVEMENT' },
  { label: 'Hospitalization', value: 'HOSPITALIZATION' },
  { label: 'Family Crisis', value: 'FAMILY_CRISIS' },
  { label: 'Safety', value: 'SAFETY' },
  { label: 'Housing', value: 'HOUSING' },
  { label: 'Employment', value: 'EMPLOYMENT' },
  { label: 'Spiritual Counseling', value: 'SPIRITUAL_COUNSELING' },
  { label: 'Repeated No Contact', value: 'REPEATED_NO_CONTACT' },
  { label: 'Other', value: 'OTHER' },
];

export const CATEGORY_LABELS: Record<EscalationCategory, string> = CATEGORY_OPTIONS.reduce(
  (acc, o) => ({ ...acc, [o.value]: o.label }),
  {} as Record<EscalationCategory, string>,
);

export const PRIORITY_OPTIONS: { label: string; value: EscalationPriority }[] = [
  { label: 'Low', value: 'LOW' },
  { label: 'Normal', value: 'NORMAL' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];

export const PRIORITY_LABELS: Record<EscalationPriority, string> = {
  LOW: 'Low',
  NORMAL: 'Normal',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const PRIORITY_BADGE: Record<EscalationPriority, BadgeVariant> = {
  LOW: 'gray',
  NORMAL: 'info',
  HIGH: 'warning',
  URGENT: 'danger',
};

export const STATUS_LABELS: Record<EscalationStatus, string> = {
  OPEN: 'Open',
  ACKNOWLEDGED: 'Acknowledged',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const STATUS_BADGE: Record<EscalationStatus, BadgeVariant> = {
  OPEN: 'danger',
  ACKNOWLEDGED: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'gray',
};

export const STATUS_OPTIONS: { label: string; value: EscalationStatus }[] = [
  { label: 'Open', value: 'OPEN' },
  { label: 'Acknowledged', value: 'ACKNOWLEDGED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
];

/** Valid forward status transitions per pastoral-escalations.validation.ts STATUSES. */
export const NEXT_STATUS_OPTIONS: Record<EscalationStatus, EscalationStatus[]> = {
  OPEN: ['ACKNOWLEDGED', 'IN_PROGRESS'],
  ACKNOWLEDGED: ['IN_PROGRESS', 'RESOLVED'],
  IN_PROGRESS: ['RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};
