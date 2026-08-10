export type UserRole =
  | 'SUPER_ADMIN'
  | 'PASTOR'
  | 'ADMINISTRATOR'
  | 'TEAM_LEAD'
  | 'FOLLOW_UP_WORKER'
  | 'COMMUNICATIONS_MANAGER'
  | 'AUDITOR'
  | 'VIEWER'
  | 'MEMBER'
  | 'USHER'
  | 'FOUNDATION_SCHOOL_TEACHER';

export interface UserProfileRole {
  id: string;
  name: string;
  code: UserRole;
  scopeType: 'GLOBAL' | 'TEAM' | 'DEPARTMENT';
  scopeId: string | null;
}

export interface ActiveChurch {
  id: string;
  name: string;
  status: string;
  subscriptionTier: string;
  subscriptionStatus: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  status?: string;
  lastLoginAt?: string | null;
  roles: UserProfileRole[];
  /** Scoped to the active church. */
  permissions: string[];
  avatarUrl?: string | null;
  isPlatformAdmin?: boolean;
  activeChurch?: ActiveChurch;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
  /** Machine-readable error code from the backend envelope (e.g. INVITE_EXPIRED), when present. */
  code?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}
