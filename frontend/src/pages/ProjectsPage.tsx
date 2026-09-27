import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ProjectStatus } from '../types';
import { useProjectStore } from '../store/projectStore';
import { getApiErrorMessage } from '../utils/errors';

const statusBadge: Record<ProjectStatus, string> = {
  PLANNING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  ARCHIVED: 'bg-slate-200 text-slate-700',
};

export function ProjectsPage() {
  const { projects, loading, loaded, fetchAll, create, remove } = useProjectStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!loaded) void fetchAll();
  }, [loaded, fetchAll]);

  useEffect(() => {
    void fetchAll({ q: search || undefined, status: statusFilter || undefined });
  }, [statusFilter, search, fetchAll]);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await create({ name, description: description || undefined });
      toast.success('Project created');
      setCreating(false);
      setName('');
      setDescription('');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create project'));
    }
  };

  const onDelete = async (id: string, name: string) => {
    if (!confirm(`Delete project "${name}"? This cannot be undone.`)) return;
    try {
      await remove(id);
      toast.success('Project deleted');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete project'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button className="btn-primary" onClick={() => setCreating(true)}>
          + New Project
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          className="input max-w-sm"
          placeholder="Search projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input max-w-xs"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | '')}
        >
          <option value="">All statuses</option>
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <p className="col-span-full text-center text-slate-500">Loading…</p>
        )}
        {!loading && projects.length === 0 && (
          <p className="col-span-full text-center text-slate-500">No projects yet.</p>
        )}
        {projects.map((p) => (
          <div key={p.id} className="card space-y-2">
            <div className="flex items-start justify-between">
              <Link to={`/projects/${p.id}`} className="text-lg font-semibold hover:text-brand-600">
                {p.name}
              </Link>
              <span className={`rounded px-2 py-0.5 text-xs ${statusBadge[p.status]}`}>
                {p.status}
              </span>
            </div>
            {p.description && (
              <p className="line-clamp-2 text-sm text-slate-600">{p.description}</p>
            )}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {p._count?.members ?? p.members.length} members · {p._count?.tasks ?? 0} tasks
              </span>
              <button
                className="text-red-600 hover:underline"
                onClick={() => onDelete(p.id, p.name)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={onCreate} className="card w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">New project</h2>
            <input
              className="input"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              required
            />
            <textarea
              className="input"
              placeholder="Description (optional)"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setCreating(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
