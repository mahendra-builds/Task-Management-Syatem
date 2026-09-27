import { TaskStatus, TaskPriority } from '../types';
import { api } from './api';

export interface DashboardTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  project: { id: string; name: string };
  assignedTo?: { id: string; name: string } | null;
}

export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export interface ProjectSummary {
  active: number;
  planning: number;
  completed: number;
  archived: number;
}

export interface DashboardData {
  stats: DashboardStats;
  myTasks: DashboardTask[];
  recent: DashboardTask[];
  upcoming: DashboardTask[];
  overdue: DashboardTask[];
  projectSummary: ProjectSummary;
}

export const dashboardApi = {
  async get() {
    const { data } = await api.get<{ data: DashboardData }>('/dashboard');
    return data.data;
  },
};
