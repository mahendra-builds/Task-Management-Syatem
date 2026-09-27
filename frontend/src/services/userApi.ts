import { Role } from '../types';
import { api } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const userApi = {
  async list() {
    const { data } = await api.get<{ data: User[] }>('/users');
    return data.data;
  },
  async getById(id: string) {
    const { data } = await api.get<{ data: User }>(`/users/${id}`);
    return data.data;
  },
  async updateProfile(payload: { name?: string; avatarUrl?: string | null }) {
    const { data } = await api.patch<{ data: User }>('/users/me/profile', payload);
    return data.data;
  },
  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    await api.post('/users/me/password', payload);
  },
  async adminUpdate(
    id: string,
    payload: { name?: string; role?: Role; isActive?: boolean; avatarUrl?: string | null },
  ) {
    const { data } = await api.patch<{ data: User }>(`/users/${id}`, payload);
    return data.data;
  },
  async adminDelete(id: string) {
    await api.delete(`/users/${id}`);
  },
};
