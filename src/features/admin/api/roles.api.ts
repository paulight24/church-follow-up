import type { AxiosResponse } from 'axios';
import api from '@/config/api';

export interface AdminPermission {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string | null;
  createdAt: string;
}

export interface AdminRolePermissionLink {
  permission: {
    id: string;
    code: string;
    name: string;
    category: string;
  };
}

export interface AdminRole {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { userRoles: number };
  rolePermissions: AdminRolePermissionLink[];
}

export interface CreateRoleRequest {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export const rolesApi = {
  getRoles(): Promise<AxiosResponse<AdminRole[]>> {
    return api.get('/users/roles/list');
  },

  createRole(data: CreateRoleRequest): Promise<AxiosResponse<AdminRole>> {
    return api.post('/users/roles', data);
  },

  updateRole(id: string, data: UpdateRoleRequest): Promise<AxiosResponse<AdminRole>> {
    return api.patch(`/users/roles/${id}`, data);
  },

  setRolePermissions(id: string, permissionIds: string[]): Promise<AxiosResponse<AdminRole>> {
    return api.put(`/users/roles/${id}/permissions`, { permissionIds });
  },

  getPermissions(): Promise<AxiosResponse<AdminPermission[]>> {
    return api.get('/users/permissions/list');
  },
};
