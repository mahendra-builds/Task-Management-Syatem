import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Role } from '../types';
import { useUserStore } from '../store/userStore';
import { User } from '../services/userApi';
import { getApiErrorMessage } from '../utils/errors';

const roleBadge: Record<Role, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  MEMBER: 'bg-slate-100 text-slate-700',
};

export function AdminUsersPage() {
  const { users, loading, loaded, fetchAll, adminUpdate, adminDelete } = useUserStore();
  const [editing, setEditing] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<Role>(Role.MEMBER);
  const [editActive, setEditActive] = useState(true);

  useEffect(() => {
    if (!loaded) void fetchAll();
  }, [loaded, fetchAll]);

  const openEdit = (u: User) => {
    setEditing(u);
    setEditName(u.name);
    setEditRole(u.role);
    setEditActive(u.isActive);
  };

  const closeEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await adminUpdate(editing.id, { name: editName, role: editRole, isActive: editActive });
      toast.success('User updated');
      closeEdit();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update user'));
    }
  };

  const remove = async (u: User) => {
    if (!confirm(`Delete user ${u.email}?`)) return;
    try {
      await adminDelete(u.id);
      toast.success('User deleted');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete user'));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin · Users</h1>

      <div className="card overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left font-medium text-slate-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2 text-slate-600">{u.email}</td>
                <td className="px-4 py-2">
                  <span className={`rounded px-2 py-0.5 text-xs ${roleBadge[u.role]}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {u.isActive ? (
                    <span className="text-green-700">Active</span>
                  ) : (
                    <span className="text-slate-400">Disabled</span>
                  )}
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="space-x-2 px-4 py-2">
                  <button onClick={() => openEdit(u)} className="btn-secondary">
                    Edit
                  </button>
                  <button onClick={() => remove(u)} className="btn-secondary text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="card w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Edit user</h2>
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input className="input mt-1" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Role</label>
              <select
                className="input mt-1"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as Role)}
              >
                <option value={Role.MEMBER}>MEMBER</option>
                <option value={Role.MANAGER}>MANAGER</option>
                <option value={Role.ADMIN}>ADMIN</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} />
              Active
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={closeEdit} className="btn-secondary">
                Cancel
              </button>
              <button onClick={saveEdit} className="btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
