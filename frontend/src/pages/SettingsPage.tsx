import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    (localStorage.getItem('tms-theme') as 'light' | 'dark' | 'system') ?? 'system',
  );
  const [notifEnabled, setNotifEnabled] = useState(
    localStorage.getItem('tms-notif') !== 'false',
  );

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem('tms-theme', theme);
    localStorage.setItem('tms-notif', String(notifEnabled));
    document.documentElement.classList.toggle('dark', theme === 'dark');
    toast.success('Preferences saved');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <form onSubmit={onSave} className="card space-y-4">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <div>
          <label className="block text-sm font-medium">Theme</label>
          <select
            className="input mt-1"
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <button className="btn-primary">Save preferences</button>
      </form>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={notifEnabled}
            onChange={(e) => setNotifEnabled(e.target.checked)}
          />
          Show in-app notifications
        </label>
      </div>

      <div className="card space-y-2">
        <h2 className="text-lg font-semibold">Account</h2>
        <p className="text-sm text-slate-500">
          Logged in as <strong>{user?.name}</strong> ({user?.email})
        </p>
        <p className="text-xs text-slate-400">Role: {user?.role}</p>
      </div>
    </div>
  );
}
