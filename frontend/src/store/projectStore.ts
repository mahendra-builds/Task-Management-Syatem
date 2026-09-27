import { create } from 'zustand';
import { Project, projectApi } from '../services/projectApi';
import { ProjectMemberRole, ProjectStatus } from '../types';

interface ProjectState {
  projects: Project[];
  total: number;
  loading: boolean;
  loaded: boolean;
  fetchAll: (params?: { status?: ProjectStatus; q?: string; page?: number; pageSize?: number }) => Promise<void>;
  getById: (id: string) => Promise<Project>;
  create: (payload: { name: string; description?: string; status?: ProjectStatus }) => Promise<Project>;
  update: (id: string, payload: Partial<{ name: string; description: string | null; status: ProjectStatus }>) => Promise<Project>;
  remove: (id: string) => Promise<void>;
  addMember: (projectId: string, payload: { userId: string; role?: ProjectMemberRole }) => Promise<void>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
  reset: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  total: 0,
  loading: false,
  loaded: false,

  async fetchAll(params) {
    set({ loading: true });
    try {
      const page = await projectApi.list(params);
      set({
        projects: page.items,
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
    const existing = get().projects.find((p) => p.id === id);
    if (existing) return existing;
    const project = await projectApi.getById(id);
    set({ projects: [project, ...get().projects.filter((p) => p.id !== id)] });
    return project;
  },

  async create(payload) {
    const project = await projectApi.create(payload);
    set({ projects: [project, ...get().projects], total: get().total + 1 });
    return project;
  },

  async update(id, payload) {
    const project = await projectApi.update(id, payload);
    set({ projects: get().projects.map((p) => (p.id === id ? project : p)) });
    return project;
  },

  async remove(id) {
    await projectApi.remove(id);
    set({
      projects: get().projects.filter((p) => p.id !== id),
      total: Math.max(0, get().total - 1),
    });
  },

  async addMember(projectId, payload) {
    const member = await projectApi.addMember(projectId, payload);
    set({
      projects: get().projects.map((p) =>
        p.id === projectId ? { ...p, members: [...p.members, member] } : p,
      ),
    });
  },

  async removeMember(projectId, userId) {
    await projectApi.removeMember(projectId, userId);
    set({
      projects: get().projects.map((p) =>
        p.id === projectId
          ? { ...p, members: p.members.filter((m) => m.userId !== userId) }
          : p,
      ),
    });
  },

  reset() {
    set({ projects: [], total: 0, loaded: false });
  },
}));
