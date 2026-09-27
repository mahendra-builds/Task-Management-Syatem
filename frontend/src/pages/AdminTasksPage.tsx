import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, AdminTask } from '../services/adminApi';

export function AdminTasksPage() {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    void adminApi
      .listTasks({
        q: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      })
      .then((res) => setTasks(res as unknown as AdminTask[]))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [search, statusFilter, priorityFilter]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin · Tasks</h1>

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
          onChange={(e) => setStatusFilter(e.target.value)}
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
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {['Title', 'Project', 'Status', 'Priority', 'Assignee', 'Due', ''].map((h) => (
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
                <td className="px-4 py-2">{t.status.replace('_', ' ')}</td>
                <td className="px-4 py-2">{t.priority}</td>
                <td className="px-4 py-2 text-slate-600">{t.assignedTo?.name ?? '—'}</td>
                <td className="px-4 py-2 text-slate-500">
                  {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2 text-slate-500">
                  <Link to={`/tasks/${t.id}`} className="text-brand-600 hover:underline">
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
