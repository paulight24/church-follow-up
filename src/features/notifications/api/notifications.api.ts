import type { AxiosResponse } from 'axios';
import type { PaginatedResponse } from '@/types';
import type { Notification, NotificationFilters } from '../types';
import api from '@/config/api';

export const notificationsApi = {
  getNotifications(filters?: NotificationFilters): Promise<AxiosResponse<PaginatedResponse<Notification>>> {
    return api.get('/notifications', {
      params: {
        unread: filters?.unread,
        type: filters?.type,
        page: filters?.page,
        pageSize: filters?.pageSize,
      },
    });
  },

  /**
   * The backend attaches `unreadCount` to the /notifications list envelope, but the
   * shared response interceptor (src/config/api.ts, not owned by this feature) unwraps
   * any paginated envelope into `{ data, meta }` and drops sibling fields like
   * unreadCount. So we derive the unread count from `meta.total` of a filtered,
   * minimal-page-size request instead of relying on that dropped field.
   */
  getUnreadCount(): Promise<AxiosResponse<PaginatedResponse<Notification>>> {
    return api.get('/notifications', { params: { unread: true, pageSize: 1 } });
  },

  markAsRead(id: string): Promise<AxiosResponse<Notification>> {
    return api.patch(`/notifications/${id}/read`);
  },

  markAllRead(): Promise<AxiosResponse<null>> {
    return api.post('/notifications/mark-all-read');
  },

  deleteNotification(id: string): Promise<AxiosResponse<null>> {
    return api.delete(`/notifications/${id}`);
  },
};
