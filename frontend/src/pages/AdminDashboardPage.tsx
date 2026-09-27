import { useEffect, useState } from 'react';
import { adminApi, AdminStats } from '../services/adminApi';

interface BreakdownBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

function BreakdownBar({ label, value, total, color }: BreakdownBarProps) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-700">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void adminApi
      .stats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Loading admin dashboard…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats && [
          ['Total Users', stats.totals.users],
          ['Active Users', stats.totals.activeUsers],
          ['Total Projects', stats.totals.projects],
          ['Total Tasks', stats.totals.tasks],
          ['Open Tasks', stats.totals.openTasks],
          ['Completed Tasks', stats.totals.completedTasks],
          ['Comments', stats.totals.comments],
          ['Notifications', stats.totals.notifications],
        ].map(([label, value]) => (
          <div key={label as string} className="card">
            <div className="text-xs text-slate-500">{label as string}</div>
            <div className="text-2xl font-bold">{value as number}</div>
          </div>
        ))}
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="card">
            <h3 className="mb-3 font-semibold">Tasks by status</h3>
            <div className="space-y-3">
              {Object.entries(stats.breakdown.tasksByStatus).map(([k, v]) => (
                <BreakdownBar key={k} label={k} value={v} total={stats.totals.tasks} color="bg-blue-500" />
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="mb-3 font-semibold">Tasks by priority</h3>
            <div className="space-y-3">
              {Object.entries(stats.breakdown.tasksByPriority).map(([k, v]) => (
                <BreakdownBar key={k} label={k} value={v} total={stats.totals.tasks} color="bg-orange-500" />
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="mb-3 font-semibold">Projects by status</h3>
            <div className="space-y-3">
              {Object.entries(stats.breakdown.projectsByStatus).map(([k, v]) => (
                <BreakdownBar key={k} label={k} value={v} total={stats.totals.projects} color="bg-green-500" />
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="mb-3 font-semibold">Users by role</h3>
            <div className="space-y-3">
              {Object.entries(stats.breakdown.usersByRole).map(([k, v]) => (
                <BreakdownBar key={k} label={k} value={v} total={stats.totals.users} color="bg-purple-500" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
