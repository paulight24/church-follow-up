import type { AxiosResponse } from 'axios';
import type {
  ReportFilters,
  FollowUpReport,
  MemberReport,
  TeamPerformanceReport,
  ContactCompletenessReport,
  OverdueTasksReport,
} from '@/types/report';
import api from '@/config/api';

export const reportsApi = {
  getFollowUpReport(filters?: ReportFilters): Promise<AxiosResponse<FollowUpReport>> {
    return api.get('/reports/follow-ups', { params: filters });
  },

  getMemberReport(filters?: ReportFilters): Promise<AxiosResponse<MemberReport>> {
    return api.get('/reports/members', { params: filters });
  },

  getTeamPerformanceReport(
    filters?: ReportFilters,
  ): Promise<AxiosResponse<TeamPerformanceReport>> {
    return api.get('/reports/team-performance', { params: filters });
  },

  getContactCompletenessReport(
    filters?: ReportFilters,
  ): Promise<AxiosResponse<ContactCompletenessReport>> {
    return api.get('/reports/contact-completeness', { params: filters });
  },

  getOverdueTasksReport(
    filters?: ReportFilters,
  ): Promise<AxiosResponse<OverdueTasksReport>> {
    return api.get('/reports/overdue-tasks', { params: filters });
  },
};
