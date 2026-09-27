import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TaskStatus, TaskPriority } from '../types';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import { getApiErrorMessage } from '../utils/errors';

const statusBadge: Record<TaskStatus, string> = {
  TODO: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  BLOCKED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-200 text-slate-500',
};

const priorityBadge: Record<TaskPriority, string> = {
  LOW: 'text-slate-500',
  MEDIUM: 'text-blue-600',
  HIGH: 'text-orange-600',
  URGENT: 'text-red-600 font-semibold',
};

export function TasksPage() {
  const { tasks, loading, loaded, fetchAll, create, remove } = useTaskStore();
  const { projects, fetchAll: fetchProjects } = useProjectStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [projectFilter, setProjectFilter] = useState('');
  const [mineOnly, setMineOnly] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: TaskPriority.MEDIUM,
    dueDate: '',
  });

  useEffect(() => {
    if (!loaded) void fetchAll();
    void fetchProjects();
  }, [loaded, fetchAll, fetchProjects]);

  useEffect(() => {
    void fetchAll({
      q: search || undefined,
      status: statusFilter || undefined,
      projectId: projectFilter || undefined,
      assignedToMe: mineOnly || undefined,
    });
  }, [search, statusFilter, projectFilter, mineOnly, fetchAll]);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await create({
        title: form.title,
        description: form.description || undefined,
        projectId: form.projectId,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
      });
      toast.success('Task created');
      setCreating(false);
      setForm({ title: '', description: '', projectId: '', priority: TaskPriority.MEDIUM, dueDate: '' });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create task'));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await remove(id);
      toast.success('Task deleted');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete task'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button className="btn-primary" onClick={() => setCreating(true)} disabled={projects.length === 0}>
          + New Task
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          className="input max-w-sm"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input max-w-xs"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
        >
          <option value="">All statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="COMPLETED">Completed</option>
          <option value="BLOCKED">Blocked</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          className="input max-w-xs"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} />
          Assigned to me
        </label>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {['Title', 'Project', 'Status', 'Priority', 'Assignee', 'Due', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-2 text-left font-medium text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading && (
              <tr><td colSpan={7} className="p-4 text-center text-slate-500">Loading…</td></tr>
            )}
            {!loading && tasks.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-slate-500">No tasks.</td></tr>
            )}
            {tasks.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-2">
                  <Link to={`/tasks/${t.id}`} className="font-medium hover:text-brand-600">
                    {t.title}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-600">{t.project.name}</td>
                <td className="px-4 py-2">
                  <span className={`rounded px-2 py-0.5 text-xs ${statusBadge[t.status]}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </td>
                <td className={`px-4 py-2 ${priorityBadge[t.priority]}`}>{t.priority}</td>
                <td className="px-4 py-2 text-slate-600">{t.assignedTo?.name ?? '—'}</td>
                <td className="px-4 py-2 text-slate-500">
                  {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                </td>
                <td className="space-x-2 px-4 py-2">
                  <button onClick={() => onDelete(t.id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={onCreate} className="card w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">New task</h2>
            <input
              className="input"
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
            <textarea
              className="input"
              placeholder="Description (optional)"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <select
              className="input"
              value={form.projectId}
              onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
              required
            >
              <option value="">Select a project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <input
              type="date"
              className="input"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setCreating(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
