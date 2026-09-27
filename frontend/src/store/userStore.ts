import { create } from 'zustand';
import { userApi, User } from '../services/userApi';
import { useAuthStore } from './authStore';

interface UserState {
  users: User[];
  loading: boolean;
  loaded: boolean;
  fetchAll: () => Promise<void>;
  updateProfile: (payload: { name?: string; avatarUrl?: string | null }) => Promise<User>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  adminUpdate: (
    id: string,
    payload: { name?: string; role?: User['role']; isActive?: boolean; avatarUrl?: string | null },
  ) => Promise<User>;
  adminDelete: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  loaded: false,

  async fetchAll() {
    set({ loading: true });
    try {
      const users = await userApi.list();
      set({ users, loaded: true, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  async updateProfile(payload) {
    const updated = await userApi.updateProfile(payload);
    const current = useAuthStore.getState().user;
    if (current && current.id === updated.id) {
      useAuthStore.setState({ user: { ...current, ...updated } });
    }
    set({ users: get().users.map((u) => (u.id === updated.id ? updated : u)) });
    return updated;
  },

  async changePassword(currentPassword, newPassword) {
    await userApi.changePassword({ currentPassword, newPassword });
  },

  async adminUpdate(id, payload) {
    const updated = await userApi.adminUpdate(id, payload);
    set({ users: get().users.map((u) => (u.id === id ? updated : u)) });
    return updated;
  },

  async adminDelete(id) {
    await userApi.adminDelete(id);
    set({ users: get().users.filter((u) => u.id !== id) });
  },
}));
