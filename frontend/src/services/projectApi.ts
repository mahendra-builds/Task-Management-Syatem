import { ProjectMemberRole, ProjectStatus, Role } from '../types';
import { api } from './api';

export interface ProjectMemberUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: Role;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  joinedAt: string;
  user: ProjectMemberUser;
}

export interface ProjectOwner {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: Role;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  ownerId: string;
  owner: ProjectOwner;
  members: ProjectMember[];
  _count?: { tasks: number; members: number };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProjects {
  items: Project[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const projectApi = {
  async list(params?: { status?: ProjectStatus; q?: string; page?: number; pageSize?: number }) {
    const { data } = await api.get<{ data: PaginatedProjects }>('/projects', { params });
    return data.data;
  },
  async getById(id: string) {
    const { data } = await api.get<{ data: Project }>(`/projects/${id}`);
    return data.data;
  },
  async create(payload: { name: string; description?: string; status?: ProjectStatus }) {
    const { data } = await api.post<{ data: Project }>('/projects', payload);
    return data.data;
  },
  async update(
    id: string,
    payload: Partial<{ name: string; description: string | null; status: ProjectStatus }>,
  ) {
    const { data } = await api.patch<{ data: Project }>(`/projects/${id}`, payload);
    return data.data;
  },
  async remove(id: string) {
    await api.delete(`/projects/${id}`);
  },
  async addMember(
    projectId: string,
    payload: { userId: string; role?: ProjectMemberRole },
  ) {
    const { data } = await api.post<{ data: ProjectMember }>(
      `/projects/${projectId}/members`,
      payload,
    );
    return data.data;
  },
  async removeMember(projectId: string, userId: string) {
    await api.delete(`/projects/${projectId}/members/${userId}`);
  },
};
