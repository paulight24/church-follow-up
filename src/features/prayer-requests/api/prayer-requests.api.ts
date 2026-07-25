import type { AxiosResponse } from 'axios';
import type {
  PrayerRequest,
  PrayerCategory,
  PrayerDashboard,
  PrayerRequestListFilters,
  CreatePrayerRequestData,
  UpdatePrayerRequestData,
} from '@/types/prayerRequest';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

export const prayerRequestsApi = {
  getPrayerRequests(
    filters?: PrayerRequestListFilters,
  ): Promise<AxiosResponse<PaginatedResponse<PrayerRequest>>> {
    return api.get('/prayer-requests', { params: filters });
  },

  getPrayerRequest(id: string): Promise<AxiosResponse<PrayerRequest>> {
    return api.get(`/prayer-requests/${id}`);
  },

  createPrayerRequest(
    data: CreatePrayerRequestData,
  ): Promise<AxiosResponse<PrayerRequest>> {
    return api.post('/prayer-requests', data);
  },

  updatePrayerRequest(
    id: string,
    data: UpdatePrayerRequestData,
  ): Promise<AxiosResponse<PrayerRequest>> {
    return api.patch(`/prayer-requests/${id}`, data);
  },

  deletePrayerRequest(id: string): Promise<AxiosResponse<void>> {
    return api.delete(`/prayer-requests/${id}`);
  },

  markPrayed(id: string): Promise<AxiosResponse<PrayerRequest>> {
    return api.post(`/prayer-requests/${id}/mark-prayed`);
  },

  assignPrayerRequest(
    id: string,
    assignedToId: string,
  ): Promise<AxiosResponse<PrayerRequest>> {
    return api.post(`/prayer-requests/${id}/assign`, { assignedToId });
  },

  createFollowUpTask(id: string): Promise<AxiosResponse<{ id: string }>> {
    return api.post(`/prayer-requests/${id}/create-follow-up-task`);
  },

  getCategories(): Promise<AxiosResponse<PrayerCategory[]>> {
    return api.get('/prayer-requests/categories');
  },

  getDashboard(): Promise<AxiosResponse<PrayerDashboard>> {
    return api.get('/prayer-requests/dashboard');
  },
};
