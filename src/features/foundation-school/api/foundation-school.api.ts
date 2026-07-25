import api from '@/config/api';

export const foundationSchoolApi = {
  getCohorts(filters?: Record<string, unknown>) {
    return api.get('/foundation-school/cohorts', { params: filters });
  },

  getCohort(id: string) {
    return api.get(`/foundation-school/cohorts/${id}`);
  },

  createCohort(data: Record<string, unknown>) {
    return api.post('/foundation-school/cohorts', data);
  },

  updateCohort(id: string, data: Record<string, unknown>) {
    return api.patch(`/foundation-school/cohorts/${id}`, data);
  },

  deleteCohort(id: string) {
    return api.delete(`/foundation-school/cohorts/${id}`);
  },
};
