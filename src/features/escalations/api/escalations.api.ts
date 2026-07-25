import type { Escalation, CreateEscalationRequest } from '@/types/escalation';
import api from '@/config/api';

interface EscalationFilters {
  status?: string;
  priority?: string;
  type?: string;
  assignedToId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ResolveEscalationData {
  resolutionNotes: string;
}

interface UpdateEscalationData {
  status?: string;
  priority?: string;
  assignedToId?: string;
  title?: string;
  description?: string;
  confidentialNotes?: string;
}

export const escalationsApi = {
  getEscalations(filters?: EscalationFilters) {
    return api.get<{ data: Escalation[]; total: number }>('/escalations', {
      params: filters,
    });
  },

  getEscalation(id: string) {
    return api.get<Escalation>(`/escalations/${id}`);
  },

  createEscalation(data: CreateEscalationRequest) {
    return api.post<Escalation>('/escalations', data);
  },

  updateEscalation(id: string, data: UpdateEscalationData) {
    return api.patch<Escalation>(`/escalations/${id}`, data);
  },

  resolveEscalation(id: string, data: ResolveEscalationData) {
    return api.post<Escalation>(`/escalations/${id}/resolve`, data);
  },
};
