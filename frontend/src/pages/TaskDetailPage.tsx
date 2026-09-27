import { useEffect, useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TaskStatus, TaskPriority } from '../types';
import { useTaskStore } from '../store/taskStore';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { CommentsSection } from '../components/CommentsSection';
import { ActivitySection } from '../components/ActivitySection';
import { getApiErrorMessage } from '../utils/errors';

const statusBadge: Record<TaskStatus, string> = {
  TODO: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  BLOCKED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-200 text-slate-500',
};

export function TaskDetailPage() {
  const { id = '' } = useParams();
  const { tasks, getById, updateStatus, update, assign, remove } = useTaskStore();
  const { users, fetchAll } = useUserStore();
  const me = useAuthStore((s) => s.user);

  const task = tasks.find((t) => t.id === id);

  useEffect(() => {
    if (!task) void getById(id);
    void fetchAll();
  }, [id, task, getById, fetchAll]);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as TaskPriority,
    dueDate: '',
    assignedToId: '',
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? '',
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
        assignedToId: task.assignedToId ?? '',
      });
    }
  }, [task]);

  if (!task) return <p className="text-slate-500">Loading task…</p>;

  const onChangeStatus = async (status: TaskStatus) => {
    try {
      await updateStatus(task.id, status);
      toast.success(`Status changed to ${status}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to change status'));
    }
  };

  const onAssign = async (userId: string) => {
    try {
      await assign(task.id, userId || null);
      toast.success(userId ? 'Task assigned' : 'Task unassigned');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to assign task'));
    }
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await update(task.id, {
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        dueDate: form.dueDate || null,
        assignedToId: form.assignedToId || null,
      });
      toast.success('Task updated');
      setEditing(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update task'));
    }
  };

  const onDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await remove(task.id);
      toast.success('Task deleted');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete task'));
    }
  };

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/tasks" className="hover:text-brand-600">Tasks</Link>
        <span>/</span>
        <span>{task.title}</span>
      </div>

      <div className="card space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <p className="text-sm text-slate-500">
              <Link to={`/projects/${task.projectId}`} className="hover:text-brand-600">
                {task.project.name}
              </Link>
              {' · '}Created by {task.createdBy.name}
            </p>
          </div>
          <span className={`rounded px-2 py-0.5 text-xs ${statusBadge[task.status]}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>

        {task.description && (
          <p className="whitespace-pre-line text-slate-700">{task.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="text-xs text-slate-500">Priority</div>
            <div className="font-medium">{task.priority}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Assignee</div>
            <div className="font-medium">{task.assignedTo?.name ?? '—'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Due date</div>
            <div className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Updated</div>
            <div className="font-medium">{new Date(task.updatedAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-3">
          <select
            className="input max-w-xs"
            value={task.status}
            onChange={(e) => onChangeStatus(e.target.value as TaskStatus)}
          >
            {Object.values(TaskStatus).map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
          <select
            className="input max-w-xs"
            value={task.assignedToId ?? ''}
            onChange={(e) => onAssign(e.target.value)}
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <button onClick={() => setEditing(true)} className="btn-secondary">Edit</button>
          {(me?.id === task.createdById || me?.id === task.project.ownerId) && (
            <button onClick={onDelete} className="btn-secondary text-red-600">Delete</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CommentsSection taskId={task.id} />
        </div>
        <ActivitySection taskId={task.id} />
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={onSave} className="card w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Edit task</h2>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <input
              type="date"
              className="input"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
            <select
              className="input"
              value={form.assignedToId}
              onChange={(e) => setForm((f) => ({ ...f, assignedToId: e.target.value }))}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
