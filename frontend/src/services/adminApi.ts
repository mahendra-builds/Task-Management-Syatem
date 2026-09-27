import { api } from './api';

export interface AdminStats {
  totals: {
    users: number;
    activeUsers: number;
    projects: number;
    tasks: number;
    openTasks: number;
    completedTasks: number;
    comments: number;
    notifications: number;
  };
  breakdown: {
    projectsByStatus: Record<string, number>;
    tasksByStatus: Record<string, number>;
    tasksByPriority: Record<string, number>;
    usersByRole: Record<string, number>;
  };
}

export interface AdminProject {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  ownerId: string;
  owner: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
  _count: { tasks: number; members: number };
}

export interface AdminTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string | null;
  project: { id: string; name: string };
  assignedTo: { id: string; name: string; email: string } | null;
  createdBy: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export const adminApi = {
  async stats() {
    const { data } = await api.get<{ data: AdminStats }>('/admin/stats');
    return data.data;
  },
  async listProjects(params?: { q?: string; status?: string; page?: number; pageSize?: number }) {
    const { data } = await api.get<{ data: AdminProject[]; meta: unknown }>('/admin/projects', {
      params,
    });
    return data.data;
  },
  async listTasks(params?: { q?: string; status?: string; priority?: string; page?: number; pageSize?: number }) {
    const { data } = await api.get<{ data: AdminTask[]; meta: unknown }>('/admin/tasks', {
      params,
    });
    return data.data;
  },
};
