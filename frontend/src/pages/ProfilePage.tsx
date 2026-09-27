import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { getApiErrorMessage } from '../utils/errors';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const changePassword = useUserStore((s) => s.changePassword);

  const [name, setName] = useState(user?.name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [saving, setSaving] = useState(false);

  const onSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, avatarUrl: avatarUrl || null });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await changePassword(current, next);
      toast.success('Password updated');
      setCurrent('');
      setNext('');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to change password'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <form onSubmit={onSaveProfile} className="card space-y-4">
        <h2 className="text-lg font-semibold">Personal info</h2>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input className="input mt-1 bg-slate-50" value={user?.email ?? ''} disabled />
        </div>
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Avatar URL</label>
          <input
            className="input mt-1"
            placeholder="https://..."
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
        </div>
        <button className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      <form onSubmit={onChangePassword} className="card space-y-4">
        <h2 className="text-lg font-semibold">Change password</h2>
        <div>
          <label className="block text-sm font-medium">Current password</label>
          <input
            className="input mt-1"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">New password</label>
          <input
            className="input mt-1"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <button className="btn-primary" disabled={saving}>
          {saving ? 'Updating...' : 'Change password'}
        </button>
      </form>
    </div>
  );
}
