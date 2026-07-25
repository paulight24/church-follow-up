export type NotificationType =
  | 'FOLLOW_UP_ASSIGNED'
  | 'FOLLOW_UP_DUE'
  | 'ESCALATION'
  | 'CAMPAIGN'
  | 'PRAYER_REQUEST'
  | 'FOUNDATION_SCHOOL'
  | 'SYSTEM'
  | (string & {});

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  /** null/undefined = unread. Read state is `readAt !== null`, not a boolean flag. */
  readAt?: string | null;
  sentAt: string;
  createdAt: string;
}

export interface NotificationFilters {
  unread?: boolean;
  type?: string;
  page?: number;
  pageSize?: number;
}
