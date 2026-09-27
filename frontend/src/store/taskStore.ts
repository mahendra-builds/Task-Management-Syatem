import { create } from 'zustand';
import { Task, taskApi } from '../services/taskApi';
import { TaskStatus, TaskPriority } from '../types';

interface TaskState {
  tasks: Task[];
  total: number;
  loading: boolean;
  loaded: boolean;
  fetchAll: (params?: {
    projectId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedToMe?: boolean;
    q?: string;
    page?: number;
    pageSize?: number;
  }) => Promise<void>;
  getById: (id: string) => Promise<Task>;
  create: (payload: {
    title: string;
    description?: string;
    projectId: string;
    assignedToId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
  }) => Promise<Task>;
  update: (
    id: string,
    payload: Partial<{
      title: string;
      description: string | null;
      priority: TaskPriority;
      dueDate: string | null;
      assignedToId: string | null;
    }>,
  ) => Promise<Task>;
  updateStatus: (id: string, status: TaskStatus) => Promise<Task>;
  assign: (id: string, assignedToId: string | null) => Promise<Task>;
  remove: (id: string) => Promise<void>;
  reset: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  total: 0,
  loading: false,
  loaded: false,

  async fetchAll(params) {
    set({ loading: true });
    try {
      const page = await taskApi.list(params);
      set({
        tasks: page.items,
        total: page.meta.total,
        loading: false,
        loaded: true,
      });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  async getById(id) {
    const existing = get().tasks.find((t) => t.id === id);
    if (existing) return existing;
    const task = await taskApi.getById(id);
    set({ tasks: [task, ...get().tasks.filter((t) => t.id !== id)] });
    return task;
  },

  async create(payload) {
    const task = await taskApi.create(payload);
    set({ tasks: [task, ...get().tasks], total: get().total + 1 });
    return task;
  },

  async update(id, payload) {
    const task = await taskApi.update(id, payload);
    set({ tasks: get().tasks.map((t) => (t.id === id ? task : t)) });
    return task;
  },

  async updateStatus(id, status) {
    const task = await taskApi.updateStatus(id, status);
    set({ tasks: get().tasks.map((t) => (t.id === id ? task : t)) });
    return task;
  },

  async assign(id, assignedToId) {
    const task = await taskApi.assign(id, assignedToId);
    set({ tasks: get().tasks.map((t) => (t.id === id ? task : t)) });
    return task;
  },

  async remove(id) {
    await taskApi.remove(id);
    set({
      tasks: get().tasks.filter((t) => t.id !== id),
      total: Math.max(0, get().total - 1),
    });
  },

  reset() {
    set({ tasks: [], total: 0, loaded: false });
  },
}));
