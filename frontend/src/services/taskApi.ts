import { TaskStatus, TaskPriority, Role } from '../types';
import { api } from './api';

export interface TaskUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role?: Role;
}

export interface TaskProject {
  id: string;
  name: string;
  status: string;
  ownerId?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  projectId: string;
  project: TaskProject;
  createdById: string;
  createdBy: TaskUser;
  assignedToId?: string | null;
  assignedTo: TaskUser | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number };
}

export interface PaginatedTasks {
  items: Task[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export const taskApi = {
  async list(params?: {
    projectId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedToMe?: boolean;
    q?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { data } = await api.get<{ data: PaginatedTasks }>('/tasks', { params });
    return data.data;
  },
  async getById(id: string) {
    const { data } = await api.get<{ data: Task }>(`/tasks/${id}`);
    return data.data;
  },
  async create(payload: {
    title: string;
    description?: string;
    projectId: string;
    assignedToId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
  }) {
    const { data } = await api.post<{ data: Task }>('/tasks', payload);
    return data.data;
  },
  async update(
    id: string,
    payload: Partial<{
      title: string;
      description: string | null;
      priority: TaskPriority;
      dueDate: string | null;
      assignedToId: string | null;
    }>,
  ) {
    const { data } = await api.patch<{ data: Task }>(`/tasks/${id}`, payload);
    return data.data;
  },
  async updateStatus(id: string, status: TaskStatus) {
    const { data } = await api.patch<{ data: Task }>(`/tasks/${id}/status`, { status });
    return data.data;
  },
  async assign(id: string, assignedToId: string | null) {
    const { data } = await api.patch<{ data: Task }>(`/tasks/${id}/assign`, { assignedToId });
    return data.data;
  },
  async remove(id: string) {
    await api.delete(`/tasks/${id}`);
  },
};
