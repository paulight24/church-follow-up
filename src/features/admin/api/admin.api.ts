import api from '@/config/api';

export const adminApi = {
  getUsers(filters?: Record<string, unknown>) {
    return api.get('/admin/users', { params: filters });
  },

  getUser(id: string) {
    return api.get(`/admin/users/${id}`);
  },

  createUser(data: Record<string, unknown>) {
    return api.post('/admin/users', data);
  },

  updateUser(id: string, data: Record<string, unknown>) {
    return api.patch(`/admin/users/${id}`, data);
  },

  deleteUser(id: string) {
    return api.delete(`/admin/users/${id}`);
  },

  getRoles() {
    return api.get('/admin/roles');
  },

  getSettings() {
    return api.get('/admin/settings');
  },

  updateSettings(data: Record<string, unknown>) {
    return api.patch('/admin/settings', data);
  },

  getAuditLogs(filters?: Record<string, unknown>) {
    return api.get('/admin/audit-logs', { params: filters });
  },
};
