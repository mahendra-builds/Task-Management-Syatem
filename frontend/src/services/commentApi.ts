import { Role } from '../types';
import { api } from './api';

export interface CommentAuthor {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: Role;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author: CommentAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityActor {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

export interface Activity {
  id: string;
  action: string;
  actorId: string;
  actor: ActivityActor;
  projectId?: string | null;
  taskId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export const commentApi = {
  async listForTask(taskId: string) {
    const { data } = await api.get<{ data: Comment[] }>(`/tasks/${taskId}/comments`);
    return data.data;
  },
  async create(taskId: string, content: string) {
    const { data } = await api.post<{ data: Comment }>(`/tasks/${taskId}/comments`, { content });
    return data.data;
  },
  async update(taskId: string, commentId: string, content: string) {
    const { data } = await api.patch<{ data: Comment }>(
      `/tasks/${taskId}/comments/${commentId}`,
      { content },
    );
    return data.data;
  },
  async remove(taskId: string, commentId: string) {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },
};

export const activityApi = {
  async listForTask(taskId: string) {
    const { data } = await api.get<{ data: Activity[]; meta: unknown }>(
      `/tasks/${taskId}/activity`,
    );
    return data.data;
  },
  async listForProject(projectId: string) {
    const { data } = await api.get<{ data: Activity[]; meta: unknown }>(
      `/projects/${projectId}/activity`,
    );
    return data.data;
  },
};
