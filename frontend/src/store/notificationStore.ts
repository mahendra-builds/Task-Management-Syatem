import { create } from 'zustand';
import { Notification, notificationApi } from '../services/notificationApi';

interface NotificationState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  loaded: boolean;
  fetch: (unreadOnly?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unreadCount: 0,
  loading: false,
  loaded: false,

  async fetch(unreadOnly = false) {
    set({ loading: true });
    try {
      const items = await notificationApi.list(unreadOnly);
      set({ items, loading: false, loaded: true });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  async fetchUnreadCount() {
    try {
      const count = await notificationApi.unreadCount();
      set({ unreadCount: count });
    } catch {
      /* ignore */
    }
  },

  async markRead(id) {
    await notificationApi.markRead(id);
    set({
      items: get().items.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });
  },

  async markAllRead() {
    await notificationApi.markAllRead();
    set({
      items: get().items.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    });
  },
}));
