import { NotificationType } from '../types';
import { api } from './api';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  userId: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
}

export const notificationApi = {
  async list(unreadOnly = false) {
    const { data } = await api.get<{ data: Notification[] }>('/notifications', {
      params: unreadOnly ? { unread: true } : {},
    });
    return data.data;
  },
  async unreadCount() {
    const { data } = await api.get<{ data: { count: number } }>('/notifications/unread-count');
    return data.data.count;
  },
  async markRead(id: string) {
    const { data } = await api.patch<{ data: Notification }>(`/notifications/${id}/read`);
    return data.data;
  },
  async markAllRead() {
    await api.patch('/notifications/read-all');
  },
};
