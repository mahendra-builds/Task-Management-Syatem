import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ProjectStatus, ProjectMemberRole } from '../types';
import { useProjectStore } from '../store/projectStore';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { getApiErrorMessage } from '../utils/errors';

const statusBadge: Record<ProjectStatus, string> = {
  PLANNING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  ARCHIVED: 'bg-slate-200 text-slate-700',
};

const memberRoleBadge: Record<ProjectMemberRole, string> = {
  OWNER: 'bg-red-100 text-red-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  MEMBER: 'bg-slate-100 text-slate-700',
  VIEWER: 'bg-slate-100 text-slate-500',
};

export function ProjectDetailPage() {
  const { id = '' } = useParams();
  const { projects, getById, update, addMember, removeMember } = useProjectStore();
  const { users, fetchAll } = useUserStore();
  const me = useAuthStore((s) => s.user);

  const project = projects.find((p) => p.id === id);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.PLANNING);
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');

  useEffect(() => {
    if (!project) void getById(id);
    void fetchAll();
  }, [id, project, getById, fetchAll]);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description ?? '');
      setStatus(project.status);
    }
  }, [project]);

  if (!project) {
    return <p className="text-slate-500">Loading project…</p>;
  }

  const isOwner = project.ownerId === me?.id;
  const myMembership = project.members.find((m) => m.userId === me?.id);
  const canEdit = isOwner || myMembership?.role === 'OWNER' || myMembership?.role === 'MANAGER';
  const canManageMembers = canEdit;

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await update(project.id, {
        name,
        description: description || null,
        status,
      });
      toast.success('Project updated');
      setEditing(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update project'));
    }
  };

  const onAddMember = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await addMember(project.id, { userId: newMemberId, role: ProjectMemberRole.MEMBER });
      toast.success('Member added');
      setAddingMember(false);
      setNewMemberId('');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to add member'));
    }
  };

  const onRemoveMember = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      await removeMember(project.id, userId);
      toast.success('Member removed');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove member'));
    }
  };

  const memberIds = new Set(project.members.map((m) => m.userId));
  const availableUsers = users.filter((u) => !memberIds.has(u.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/projects" className="hover:text-brand-600">Projects</Link>
        <span>/</span>
        <span>{project.name}</span>
      </div>

      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-sm text-slate-500">
              Owner: {project.owner.name} · Created{' '}
              {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`rounded px-2 py-0.5 text-xs ${statusBadge[project.status]}`}>
            {project.status}
          </span>
        </div>
        {project.description && (
          <p className="mt-2 text-slate-700">{project.description}</p>
        )}
        {canEdit && (
          <button onClick={() => setEditing(true)} className="btn-secondary mt-4">
            Edit project
          </button>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Members ({project.members.length})</h2>
          {canManageMembers && (
            <button onClick={() => setAddingMember(true)} className="btn-primary">
              + Add member
            </button>
          )}
        </div>
        <ul className="mt-3 divide-y divide-slate-100">
          {project.members.map((m) => (
            <li key={m.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                  {m.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{m.user.name}</div>
                  <div className="text-xs text-slate-500">{m.user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs ${memberRoleBadge[m.role]}`}>
                  {m.role}
                </span>
                {canManageMembers && m.userId !== project.ownerId && (
                  <button
                    onClick={() => onRemoveMember(m.userId)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={onSave} className="card w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Edit project</h2>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              required
            />
            <textarea
              className="input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            >
              <option value={ProjectStatus.PLANNING}>Planning</option>
              <option value={ProjectStatus.ACTIVE}>Active</option>
              <option value={ProjectStatus.COMPLETED}>Completed</option>
              <option value={ProjectStatus.ARCHIVED}>Archived</option>
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {addingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={onAddMember} className="card w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Add member</h2>
            <select
              className="input"
              value={newMemberId}
              onChange={(e) => setNewMemberId(e.target.value)}
              required
            >
              <option value="">Select a user…</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setAddingMember(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={!newMemberId}>
                Add
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
