import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/projects', label: 'Projects', icon: '📁' },
  { to: '/tasks', label: 'Tasks', icon: '✅' },
  { to: '/kanban', label: 'Kanban', icon: '🗂️' },
  { to: '/team', label: 'Team', icon: '👥' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/profile', label: 'Profile', icon: '👤' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

const adminItems = [
  { to: '/admin', label: 'Admin · Overview', icon: '🛡️' },
  { to: '/admin/users', label: 'Admin · Users', icon: '🛡️' },
  { to: '/admin/projects', label: 'Admin · Projects', icon: '🛡️' },
  { to: '/admin/tasks', label: 'Admin · Tasks', icon: '🛡️' },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
      <div className="flex h-16 items-center border-b border-slate-200 px-6 text-lg font-bold text-brand-600">
        TaskMgr
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="my-3 border-t border-slate-200" />
        {adminItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
