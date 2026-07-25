import api from '@/config/api';

export const callGuidesApi = {
  getCallGuides() {
    return api.get('/call-guides');
  },

  getCallGuide(id: string) {
    return api.get(`/call-guides/${id}`);
  },

  createCallGuide(data: Record<string, unknown>) {
    return api.post('/call-guides', data);
  },

  updateCallGuide(id: string, data: Record<string, unknown>) {
    return api.patch(`/call-guides/${id}`, data);
  },

  deleteCallGuide(id: string) {
    return api.delete(`/call-guides/${id}`);
  },
};
