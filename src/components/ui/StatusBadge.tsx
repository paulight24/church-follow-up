import { Badge } from './Badge';
import type { ComponentProps } from 'react';

type BadgeVariant = ComponentProps<typeof Badge>['variant'];

type StatusType =
  | 'followUp'
  | 'member'
  | 'escalation'
  | 'campaign'
  | 'announcement'
  | 'event'
  | 'flyer'
  | 'printOrder';

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
  announcement: {
    DRAFT: 'gray',
    PUBLISHED: 'success',
    ARCHIVED: 'gray',
  },
  event: {
    DRAFT: 'gray',
    PUBLISHED: 'success',
    CLOSED: 'warning',
    CANCELLED: 'danger',
  },
  flyer: {
    DRAFT: 'gray',
    GENERATING: 'info',
    READY: 'purple',
    APPROVED: 'success',
    ARCHIVED: 'gray',
  },
  // All fourteen fulfilment states are mapped: an unmapped one renders an
  // undefined variant, which is a blank badge rather than a visible bug.
  printOrder: {
    DRAFT: 'gray',
    QUOTED: 'info',
    AWAITING_PAYMENT: 'warning',
    PAID: 'info',
    SUBMITTING: 'info',
    SUBMITTED: 'info',
    ACCEPTED: 'info',
    PRINTING: 'purple',
    READY_FOR_PICKUP: 'success',
    SHIPPED: 'success',
    DELIVERED: 'success',
    COMPLETED: 'success',
    CANCELLED: 'gray',
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
