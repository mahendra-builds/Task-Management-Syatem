import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../store/notificationStore';

export function NotificationBell() {
  const navigate = useNavigate();
  const { items, unreadCount, fetch, fetchUnreadCount, markRead, markAllRead } =
    useNotificationStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetchUnreadCount();
    const id = setInterval(() => void fetchUnreadCount(), 30_000);
    return () => clearInterval(id);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (open && items.length === 0) void fetch(false);
  }, [open, items.length, fetch]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const onClickItem = async (id: string, link?: string | null) => {
    await markRead(id);
    setOpen(false);
    if (link) navigate(link);
  };

  return (
    <div ref={ref} className="relative">
      <button
        className="relative rounded p-2 hover:bg-slate-100"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {items.some((n) => !n.read) && (
              <button onClick={() => void markAllRead()} className="text-xs text-brand-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <li className="p-4 text-center text-sm text-slate-500">No notifications.</li>
            )}
            {items.map((n) => (
              <li
                key={n.id}
                className={`cursor-pointer border-b border-slate-100 px-3 py-2 hover:bg-slate-50 ${
                  !n.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => void onClickItem(n.id, n.link)}
              >
                <div className="flex items-start gap-2 text-sm">
                  {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                  <div>
                    <p className="text-slate-700">{n.message}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-200 px-3 py-2 text-center">
            <Link to="/notifications" className="text-sm text-brand-600 hover:underline">
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
