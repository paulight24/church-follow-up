export type UserRole =
  | 'SUPER_ADMIN'
  | 'PASTOR'
  | 'ADMIN'
  | 'TEAM_LEAD'
  | 'FOLLOW_UP_WORKER'
  | 'VIEWER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: string[];
  churchId: string;
  avatarUrl?: string;
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
}

export interface SelectOption {
  label: string;
  value: string;
}
