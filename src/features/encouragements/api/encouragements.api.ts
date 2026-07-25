import type { AxiosResponse } from 'axios';
import type { PaginatedResponse } from '@/types';
import type {
  CreateEncouragementRequest,
  Encouragement,
  EncouragementAnalytics,
  EncouragementListFilters,
  EncouragementRecipient,
  EncouragementResponse,
  EncouragementSendResult,
  EncouragementTemplate,
  MemberMessagePreference,
  QuickSendRequest,
  UpdateEncouragementRequest,
} from '@/types/encouragement';
import api from '@/config/api';

export const encouragementsApi = {
  getEncouragements(filters?: EncouragementListFilters): Promise<AxiosResponse<PaginatedResponse<Encouragement>>> {
    return api.get('/encouragements', { params: filters });
  },

  getEncouragement(id: string): Promise<AxiosResponse<Encouragement>> {
    return api.get(`/encouragements/${id}`);
  },

  createEncouragement(data: CreateEncouragementRequest): Promise<AxiosResponse<Encouragement>> {
    return api.post('/encouragements', data);
  },

  updateEncouragement(id: string, data: UpdateEncouragementRequest): Promise<AxiosResponse<Encouragement>> {
    return api.patch(`/encouragements/${id}`, data);
  },

  deleteEncouragement(id: string): Promise<AxiosResponse<null>> {
    return api.delete(`/encouragements/${id}`);
  },

  submitForApproval(id: string): Promise<AxiosResponse<Encouragement>> {
    return api.post(`/encouragements/${id}/submit-for-approval`);
  },

  approveEncouragement(id: string): Promise<AxiosResponse<Encouragement>> {
    return api.post(`/encouragements/${id}/approve`);
  },

  scheduleEncouragement(id: string, scheduledAt: string): Promise<AxiosResponse<Encouragement>> {
    return api.post(`/encouragements/${id}/schedule`, { scheduledAt });
  },

  sendEncouragementNow(id: string): Promise<AxiosResponse<EncouragementSendResult>> {
    return api.post(`/encouragements/${id}/send`);
  },

  cancelEncouragement(id: string): Promise<AxiosResponse<Encouragement>> {
    return api.post(`/encouragements/${id}/cancel`);
  },

  quickSend(data: QuickSendRequest): Promise<AxiosResponse<EncouragementSendResult>> {
    return api.post('/encouragements/quick-send', data);
  },

  getRecipients(
    id: string,
    params?: { page?: number; pageSize?: number; status?: string; channel?: string },
  ): Promise<AxiosResponse<PaginatedResponse<EncouragementRecipient>>> {
    return api.get(`/encouragements/${id}/recipients`, { params });
  },

  getAnalytics(id: string): Promise<AxiosResponse<EncouragementAnalytics>> {
    return api.get(`/encouragements/${id}/analytics`);
  },

  getResponses(id: string, params?: { page?: number; pageSize?: number }): Promise<
    AxiosResponse<PaginatedResponse<EncouragementResponse>>
  > {
    return api.get(`/encouragements/${id}/responses`, { params });
  },

  getTemplates(isActive?: boolean): Promise<AxiosResponse<EncouragementTemplate[]>> {
    return api.get('/encouragements/templates', { params: { isActive } });
  },

  getMemberPreference(memberId: string): Promise<AxiosResponse<MemberMessagePreference>> {
    return api.get(`/encouragements/members/${memberId}/preferences`);
  },
};

// ─── Reference-data lookups used by the audience builder ───────────────────
// These hit real church-structure endpoints (departments, fellowship groups,
// teams, members) that already exist on the backend outside this module.

export interface LookupOption {
  id: string;
  name: string;
}

export const lookupsApi = {
  getDepartments(): Promise<AxiosResponse<PaginatedResponse<LookupOption>>> {
    return api.get('/departments', { params: { pageSize: 100, status: 'ACTIVE' } });
  },

  getFellowshipGroups(): Promise<AxiosResponse<PaginatedResponse<LookupOption>>> {
    return api.get('/fellowship-groups', { params: { pageSize: 100, status: 'ACTIVE' } });
  },

  getTeams(): Promise<AxiosResponse<PaginatedResponse<LookupOption>>> {
    return api.get('/teams', { params: { pageSize: 100, status: 'ACTIVE' } });
  },

  searchMembers(search: string): Promise<
    AxiosResponse<
      PaginatedResponse<{ id: string; firstName: string; lastName: string; email?: string | null }>
    >
  > {
    return api.get('/members', { params: { search, pageSize: 20 } });
  },
};
