import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { activityApi, Activity } from '../services/commentApi';
import { getApiErrorMessage } from '../utils/errors';
import { formatDistanceToNow } from 'date-fns';

const ACTION_LABELS: Record<string, string> = {
  TASK_CREATED: 'created task',
  TASK_ASSIGNED: 'assigned a task',
  TASK_STATUS_CHANGED: 'changed status',
  TASK_PRIORITY_CHANGED: 'changed priority',
  TASK_COMPLETED: 'completed a task',
  TASK_COMMENTED: 'commented on a task',
  TASK_DELETED: 'deleted a task',
  PROJECT_CREATED: 'created project',
  PROJECT_UPDATED: 'updated project',
  PROJECT_MEMBER_ADDED: 'added a member',
  PROJECT_MEMBER_REMOVED: 'removed a member',
  USER_CREATED: 'joined',
};

interface Props {
  taskId?: string;
  projectId?: string;
}

export function ActivitySection({ taskId, projectId }: Props) {
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId && !projectId) return;
    void (async () => {
      try {
        const data = taskId
          ? await activityApi.listForTask(taskId)
          : await activityApi.listForProject(projectId!);
        setItems(data);
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to load activity'));
      } finally {
        setLoading(false);
      }
    })();
  }, [taskId, projectId]);

  return (
    <div className="card">
      <h3 className="mb-3 font-semibold">Activity</h3>
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {!loading && items.length === 0 && (
        <p className="text-sm text-slate-500">No activity yet.</p>
      )}
      <ul className="space-y-3">
        {items.map((a) => (
          <li key={a.id} className="flex items-start gap-3 text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
              {a.actor.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div>
                <span className="font-medium">{a.actor.name}</span>{' '}
                <span className="text-slate-600">
                  {ACTION_LABELS[a.action] ?? a.action.toLowerCase().replace(/_/g, ' ')}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
