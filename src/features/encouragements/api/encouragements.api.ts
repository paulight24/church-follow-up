import type { Encouragement, CreateEncouragementRequest } from '@/types/encouragement';
import api from '@/config/api';

interface EncouragementFilters {
  channel?: string;
  audience?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface UpdateEncouragementData {
  title?: string;
  message?: string;
  scriptureReference?: string;
  scriptureText?: string;
  channel?: string;
  audience?: string;
}

export const encouragementsApi = {
  getEncouragements(filters?: EncouragementFilters) {
    return api.get<{ data: Encouragement[]; total: number }>('/encouragements', {
      params: filters,
    });
  },

  getEncouragement(id: string) {
    return api.get<Encouragement>(`/encouragements/${id}`);
  },

  createEncouragement(data: CreateEncouragementRequest) {
    return api.post<Encouragement>('/encouragements', data);
  },

  updateEncouragement(id: string, data: UpdateEncouragementData) {
    return api.patch<Encouragement>(`/encouragements/${id}`, data);
  },

  deleteEncouragement(id: string) {
    return api.delete(`/encouragements/${id}`);
  },
};
