import type { AxiosResponse } from 'axios';
import api from '@/config/api';
import type { PaginatedResponse, UserRole } from '@/types';

export interface AdminUserRoleAssignment {
  id: string; // role id
  name: string;
  code: UserRole;
  scopeType: 'GLOBAL' | 'TEAM' | 'DEPARTMENT';
  scopeId: string | null;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  roles: AdminUserRoleAssignment[];
}

export interface AdminUserRoleDetail extends AdminUserRoleAssignment {
  userRoleId: string;
  startsAt: string | null;
  endsAt: string | null;
}

export interface AdminPermissionOverride {
  id: string;
  permissionId: string;
  code: string;
  name: string;
  effect: 'ALLOW' | 'DENY';
  scopeType: string;
  scopeId: string | null;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  roles: AdminUserRoleDetail[];
  permissions: string[];
  permissionOverrides: AdminPermissionOverride[];
}

export interface UserListFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'DEACTIVATED';
  roleId?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleIds?: string[];
}

export interface UpdateUserRequest {
  /** Accepted only while the account is still INVITED. */
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface AssignRoleRequest {
  roleId: string;
  scopeType?: 'GLOBAL' | 'TEAM' | 'DEPARTMENT';
  scopeId?: string;
  startsAt?: string;
  endsAt?: string;
}

export interface GrantPermissionOverrideRequest {
  permissionId: string;
  effect: 'ALLOW' | 'DENY';
  scopeType?: 'GLOBAL' | 'TEAM' | 'DEPARTMENT';
  scopeId?: string;
}

/** An invite can be recorded without being delivered — see deliveryWarning. */
export interface InviteResult {
  userId: string;
  email: string;
  /** Null when the email genuinely went out. */
  deliveryWarning: string | null;
}

export const usersApi = {
  getUsers(filters: UserListFilters = {}): Promise<AxiosResponse<PaginatedResponse<AdminUserListItem>>> {
    return api.get('/users', { params: filters });
  },

  getUser(id: string): Promise<AxiosResponse<AdminUserDetail>> {
    return api.get(`/users/${id}`);
  },

  createUser(data: CreateUserRequest): Promise<AxiosResponse<AdminUserDetail>> {
    return api.post('/users', data);
  },

  updateUser(id: string, data: UpdateUserRequest): Promise<AxiosResponse<AdminUserDetail>> {
    return api.patch(`/users/${id}`, data);
  },

  deactivateUser(id: string): Promise<AxiosResponse<null>> {
    return api.post(`/users/${id}/deactivate`);
  },

  /** POST /users/:id/resend-invite - gated server-side on users.create. Only meaningful for status === 'INVITED'. */
  resendInvite(id: string): Promise<AxiosResponse<InviteResult>> {
    return api.post(`/users/${id}/resend-invite`);
  },

  getUserRoles(id: string): Promise<AxiosResponse<AdminUserRoleDetail[]>> {
    return api.get(`/users/${id}/roles`);
  },

  assignRole(id: string, data: AssignRoleRequest): Promise<AxiosResponse<AdminUserDetail>> {
    return api.post(`/users/${id}/roles`, data);
  },

  removeRole(id: string, userRoleId: string): Promise<AxiosResponse<AdminUserDetail>> {
    return api.delete(`/users/${id}/roles/${userRoleId}`);
  },

  grantPermissionOverride(
    id: string,
    data: GrantPermissionOverrideRequest,
  ): Promise<AxiosResponse<AdminPermissionOverride>> {
    return api.post(`/users/${id}/permission-overrides`, data);
  },

  revokePermissionOverride(id: string, overrideId: string): Promise<AxiosResponse<null>> {
    return api.delete(`/users/${id}/permission-overrides/${overrideId}`);
  },
};
