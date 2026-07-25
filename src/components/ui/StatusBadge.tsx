import { Badge } from './Badge';
import type { ComponentProps } from 'react';

type BadgeVariant = ComponentProps<typeof Badge>['variant'];

type StatusType = 'followUp' | 'member' | 'escalation' | 'campaign';

const statusMaps: Record<StatusType, Record<string, BadgeVariant>> = {
  followUp: {
    PENDING: 'gray',
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
    MISSED: 'danger',
    ESCALATED: 'warning',
  },
  member: {
    Active: 'success',
    Inactive: 'gray',
    New: 'info',
    First_Timer: 'purple',
  },
  escalation: {
    OPEN: 'danger',
    IN_PROGRESS: 'warning',
    RESOLVED: 'success',
    CLOSED: 'gray',
  },
  campaign: {
    DRAFT: 'gray',
    SCHEDULED: 'info',
    SENDING: 'warning',
    SENT: 'success',
    FAILED: 'danger',
  },
};

function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const variant = statusMaps[type]?.[status] ?? 'gray';

  return (
    <Badge variant={variant} dot className={className}>
      {formatStatus(status)}
    </Badge>
  );
}
