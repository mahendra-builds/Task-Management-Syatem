import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { dashboardApi, DashboardData, DashboardTask } from '../services/dashboardApi';

interface StatCard {
  label: string;
  value: number;
  color: string;
}

function TaskList({ title, items, emptyText }: { title: string; items: DashboardTask[]; emptyText: string }) {
  return (
    <div className="card">
      <h3 className="mb-3 font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((t) => (
            <li key={t.id} className="flex items-center justify-between text-sm">
              <Link to={`/tasks/${t.id}`} className="line-clamp-1 hover:text-brand-600">
                {t.title}
              </Link>
              <span className="text-xs text-slate-500">
                {t.project.name}
                {t.dueDate && (
                  <span className="ml-2">
                    {new Date(t.dueDate).toLocaleDateString()}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void dashboardApi
      .get()
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-slate-500">Loading dashboard…</p>;
  }

  const stats: StatCard[] = data
    ? [
        { label: 'Total Tasks', value: data.stats.total, color: 'bg-slate-100 text-slate-700' },
        { label: 'Pending', value: data.stats.pending, color: 'bg-yellow-100 text-yellow-700' },
        { label: 'In Progress', value: data.stats.inProgress, color: 'bg-blue-100 text-blue-700' },
        { label: 'Completed', value: data.stats.completed, color: 'bg-green-100 text-green-700' },
        { label: 'Overdue', value: data.stats.overdue, color: 'bg-red-100 text-red-700' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className={`mb-2 inline-block rounded px-2 py-0.5 text-xs ${s.color}`}>
              {s.label}
            </div>
            <div className="text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TaskList title="My tasks" items={data.myTasks} emptyText="No tasks assigned to you." />
            <TaskList title="Recent activity" items={data.recent} emptyText="No recent tasks." />
            <TaskList title="Upcoming deadlines" items={data.upcoming} emptyText="Nothing due this week." />
            <TaskList title="Overdue" items={data.overdue} emptyText="No overdue tasks. 🎉" />
          </div>

          <div className="card">
            <h3 className="mb-3 font-semibold">Projects overview</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <div className="text-xs text-slate-500">Active</div>
                <div className="text-2xl font-bold text-green-600">
                  {data.projectSummary.active}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Planning</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {data.projectSummary.planning}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Completed</div>
                <div className="text-2xl font-bold text-blue-600">
                  {data.projectSummary.completed}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Archived</div>
                <div className="text-2xl font-bold text-slate-500">
                  {data.projectSummary.archived}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
