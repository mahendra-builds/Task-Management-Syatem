import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, AdminProject } from '../services/adminApi';

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    void adminApi
      .listProjects({ q: search || undefined, status: statusFilter || undefined })
      .then((res) => setProjects(res as unknown as AdminProject[]))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin · Projects</h1>

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
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {['Name', 'Owner', 'Status', 'Members', 'Tasks', 'Updated', ''].map((h) => (
                <th key={h} className="px-4 py-2 text-left font-medium text-slate-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading && (
              <tr><td colSpan={7} className="p-4 text-center text-slate-500">Loading…</td></tr>
            )}
            {!loading && projects.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-slate-500">No projects.</td></tr>
            )}
            {projects.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2">
                  <Link to={`/projects/${p.id}`} className="font-medium hover:text-brand-600">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-600">{p.owner.name}</td>
                <td className="px-4 py-2">{p.status}</td>
                <td className="px-4 py-2">{p._count.members}</td>
                <td className="px-4 py-2">{p._count.tasks}</td>
                <td className="px-4 py-2 text-slate-500">
                  {new Date(p.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-slate-500">
                  <Link to={`/projects/${p.id}`} className="text-brand-600 hover:underline">
                    Open →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
