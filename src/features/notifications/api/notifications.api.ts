import api from '@/config/api';

export const notificationsApi = {
  getNotifications() {
    return api.get('/notifications');
  },

  markAsRead(id: string) {
    return api.patch(`/notifications/${id}/read`);
  },

  markAllRead() {
    return api.post('/notifications/read-all');
  },
};
