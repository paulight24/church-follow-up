import type { AxiosResponse } from 'axios';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  before: string | null;
  after: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string } | null;
}

export interface AuditLogFilters {
  page?: number;
  pageSize?: number;
  userId?: string;
  action?: string;
  entity?: string;
  startDate?: string;
  endDate?: string;
}

export const auditLogsApi = {
  getAuditLogs(filters: AuditLogFilters = {}): Promise<AxiosResponse<PaginatedResponse<AuditLogEntry>>> {
    return api.get('/audit-logs', { params: filters });
  },
  getActions(): Promise<AxiosResponse<string[]>> {
    return api.get('/audit-logs/actions');
  },
  getEntities(): Promise<AxiosResponse<string[]>> {
    return api.get('/audit-logs/entities');
  },
};
