import type { AxiosResponse } from 'axios';
import type {
  Escalation,
  EscalationListFilters,
  CreateEscalationRequest,
  UpdateEscalationRequest,
  PastoralNote,
  CreateNoteRequest,
} from '@/types/escalation';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

export const escalationsApi = {
  getEscalations(filters?: EscalationListFilters): Promise<AxiosResponse<PaginatedResponse<Escalation>>> {
    return api.get('/pastoral-escalations', { params: filters });
  },

  getEscalation(id: string): Promise<AxiosResponse<Escalation>> {
    return api.get(`/pastoral-escalations/${id}`);
  },

  createEscalation(data: CreateEscalationRequest): Promise<AxiosResponse<Escalation>> {
    return api.post('/pastoral-escalations', data);
  },

  updateEscalation(id: string, data: UpdateEscalationRequest): Promise<AxiosResponse<Escalation>> {
    return api.patch(`/pastoral-escalations/${id}`, data);
  },

  getNotes(id: string): Promise<AxiosResponse<PastoralNote[]>> {
    return api.get(`/pastoral-escalations/${id}/notes`);
  },

  createNote(id: string, data: CreateNoteRequest): Promise<AxiosResponse<PastoralNote>> {
    return api.post(`/pastoral-escalations/${id}/notes`, data);
  },
};
