import api from '@/config/api';

export const reportsApi = {
  getFollowUpReport(filters?: Record<string, unknown>) {
    return api.get('/reports/follow-ups', { params: filters });
  },

  getTeamPerformance(filters?: Record<string, unknown>) {
    return api.get('/reports/team-performance', { params: filters });
  },

  getMemberGrowth(filters?: Record<string, unknown>) {
    return api.get('/reports/member-growth', { params: filters });
  },

  getAttendanceTrends(filters?: Record<string, unknown>) {
    return api.get('/reports/attendance', { params: filters });
  },

  getEscalationReport(filters?: Record<string, unknown>) {
    return api.get('/reports/escalations', { params: filters });
  },

  getCommunicationReport(filters?: Record<string, unknown>) {
    return api.get('/reports/communications', { params: filters });
  },

  exportReport(type: string, format: string, filters?: Record<string, unknown>) {
    return api.get(`/reports/${type}/export`, {
      params: { format, ...filters },
      responseType: 'blob',
    });
  },
};
