import api from '@/config/api';

export const prayerRequestsApi = {
  getPrayerRequests(filters?: Record<string, unknown>) {
    return api.get('/prayer-requests', { params: filters });
  },

  getPrayerRequest(id: string) {
    return api.get(`/prayer-requests/${id}`);
  },

  createPrayerRequest(data: Record<string, unknown>) {
    return api.post('/prayer-requests', data);
  },

  updatePrayerRequest(id: string, data: Record<string, unknown>) {
    return api.patch(`/prayer-requests/${id}`, data);
  },

  deletePrayerRequest(id: string) {
    return api.delete(`/prayer-requests/${id}`);
  },
};
