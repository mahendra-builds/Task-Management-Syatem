import { useEffect, useState } from 'react';
import { useUserStore } from '../store/userStore';
import { Role } from '../types';

const roleBadge: Record<Role, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  MEMBER: 'bg-slate-100 text-slate-700',
};

export function TeamPage() {
  const { users, loading, loaded, fetchAll } = useUserStore();
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!loaded) void fetchAll();
  }, [loaded, fetchAll]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(filter.toLowerCase()) ||
      u.email.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Team</h1>
      <input
        className="input max-w-sm"
        placeholder="Search by name or email…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <p className="col-span-full text-center text-slate-500">Loading…</p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="col-span-full text-center text-slate-500">No team members match.</p>
        )}
        {filtered.map((u) => (
          <div key={u.id} className="card flex items-center gap-4">
            {u.avatarUrl ? (
              <img src={u.avatarUrl} alt={u.name} className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
                {u.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="font-semibold">{u.name}</div>
              <div className="text-sm text-slate-500">{u.email}</div>
              <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${roleBadge[u.role]}`}>
                {u.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
