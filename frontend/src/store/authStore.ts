import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';
import { Role } from '../types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      initialized: false,

      async login(email, password) {
        set({ loading: true });
        try {
          const { data } = await api.post<{ data: { user: AuthUser; token: string } }>(
            '/auth/login',
            { email, password },
          );
          set({ user: data.data.user, token: data.data.token, loading: false });
        } catch (e) {
          set({ loading: false });
          throw e;
        }
      },

      async register(name, email, password) {
        set({ loading: true });
        try {
          const { data } = await api.post<{ data: { user: AuthUser; token: string } }>(
            '/auth/register',
            { name, email, password },
          );
          set({ user: data.data.user, token: data.data.token, loading: false });
        } catch (e) {
          set({ loading: false });
          throw e;
        }
      },

      async logout() {
        try {
          await api.post('/auth/logout');
        } catch {
          // ignore network errors — we're logging out anyway
        }
        get().reset();
      },

      async fetchMe() {
        try {
          const { data } = await api.get<{ data: AuthUser }>('/auth/me');
          set({ user: data.data, initialized: true });
        } catch {
          set({ user: null, token: null, initialized: true });
        }
      },

      reset() {
        set({ user: null, token: null });
      },
    }),
    {
      name: 'tms-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
