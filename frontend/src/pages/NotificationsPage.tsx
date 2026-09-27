import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useNotificationStore } from '../store/notificationStore';
import { getApiErrorMessage } from '../utils/errors';

export function NotificationsPage() {
  const { items, loading, loaded, fetch, markRead, markAllRead } = useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loaded) void fetch();
  }, [loaded, fetch]);

  const visible = filter === 'unread' ? items.filter((n) => !n.read) : items;

  const onClick = async (id: string, link?: string | null) => {
    try {
      await markRead(id);
      if (link) navigate(link);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to mark as read'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex items-center gap-2">
          <select
            className="input max-w-xs"
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
          >
            <option value="all">All</option>
            <option value="unread">Unread only</option>
          </select>
          <button onClick={() => void markAllRead()} className="btn-secondary">
            Mark all read
          </button>
        </div>
      </div>

      <div className="card p-0">
        <ul className="divide-y divide-slate-100">
          {loading && (
            <li className="p-4 text-center text-slate-500">Loading…</li>
          )}
          {!loading && visible.length === 0 && (
            <li className="p-4 text-center text-slate-500">No notifications.</li>
          )}
          {visible.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 ${
                !n.read ? 'bg-blue-50' : ''
              } ${n.link ? 'cursor-pointer hover:bg-slate-50' : ''}`}
              onClick={() => void onClick(n.id, n.link)}
            >
              {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
              <div className="flex-1">
                <p className="text-sm text-slate-700">{n.message}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(n.createdAt).toLocaleString()} · {n.type.replace(/_/g, ' ').toLowerCase()}
                </p>
                {n.link && (
                  <Link to={n.link} className="mt-1 inline-block text-xs text-brand-600 hover:underline">
                    Open →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
