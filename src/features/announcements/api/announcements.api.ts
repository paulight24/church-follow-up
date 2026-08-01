import type { AxiosResponse } from 'axios';
import api from '@/config/api';
import type { PaginatedResponse } from '@/types';
import type {
  Announcement,
  AnnouncementListFilters,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from '@/types/announcement';

export const announcementsApi = {
  /** Member-facing feed - GET /announcements/feed (gated `announcements.view`). */
  getFeed(): Promise<AxiosResponse<Announcement[]>> {
    return api.get('/announcements/feed');
  },

  /** Management list across all statuses - gated on an authoring permission, never bare `view`. */
  getAnnouncements(filters?: AnnouncementListFilters): Promise<AxiosResponse<PaginatedResponse<Announcement>>> {
    return api.get('/announcements', { params: filters });
  },

  getAnnouncement(id: string): Promise<AxiosResponse<Announcement>> {
    return api.get(`/announcements/${id}`);
  },

  createAnnouncement(data: CreateAnnouncementRequest): Promise<AxiosResponse<Announcement>> {
    return api.post('/announcements', data);
  },

  updateAnnouncement(id: string, data: UpdateAnnouncementRequest): Promise<AxiosResponse<Announcement>> {
    return api.patch(`/announcements/${id}`, data);
  },

  deleteAnnouncement(id: string): Promise<AxiosResponse<null>> {
    return api.delete(`/announcements/${id}`);
  },

  publishAnnouncement(id: string): Promise<AxiosResponse<Announcement>> {
    return api.post(`/announcements/${id}/publish`);
  },

  unpublishAnnouncement(id: string): Promise<AxiosResponse<Announcement>> {
    return api.post(`/announcements/${id}/unpublish`);
  },
};
