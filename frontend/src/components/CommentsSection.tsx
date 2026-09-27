import { useEffect, useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { commentApi, Comment } from '../services/commentApi';
import { useAuthStore } from '../store/authStore';
import { getApiErrorMessage } from '../utils/errors';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  taskId: string;
  refreshKey?: number;
}

export function CommentsSection({ taskId, refreshKey = 0 }: Props) {
  const me = useAuthStore((s) => s.user);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const data = await commentApi.listForTask(taskId);
        setComments(data);
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to load comments'));
      } finally {
        setLoading(false);
      }
    })();
  }, [taskId, refreshKey]);

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    try {
      const c = await commentApi.create(taskId, draft);
      setComments((prev) => [...prev, c]);
      setDraft('');
      toast.success('Comment added');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to add comment'));
    }
  };

  const onSaveEdit = async (id: string) => {
    try {
      const updated = await commentApi.update(taskId, id, editDraft);
      setComments((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
      setEditDraft('');
      toast.success('Comment updated');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update comment'));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await commentApi.remove(taskId, id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete comment'));
    }
  };

  return (
    <div className="card space-y-4">
      <h3 className="font-semibold">Comments ({comments.length})</h3>

      <ul className="space-y-3">
        {loading && <li className="text-sm text-slate-500">Loading…</li>}
        {!loading && comments.length === 0 && (
          <li className="text-sm text-slate-500">No comments yet. Be the first!</li>
        )}
        {comments.map((c) => (
          <li key={c.id} className="rounded border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  {c.author.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-medium">{c.author.name}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    {c.updatedAt !== c.createdAt && ' · edited'}
                  </span>
                </div>
              </div>
              {(me?.id === c.authorId || me?.role === 'ADMIN') && editingId !== c.id && (
                <div className="space-x-2 text-xs">
                  {me?.id === c.authorId && (
                    <button
                      className="text-slate-500 hover:underline"
                      onClick={() => {
                        setEditingId(c.id);
                        setEditDraft(c.content);
                      }}
                    >
                      Edit
                    </button>
                  )}
                  <button className="text-red-600 hover:underline" onClick={() => onDelete(c.id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
            {editingId === c.id ? (
              <div className="space-y-2">
                <textarea
                  className="input"
                  rows={3}
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingId(null)} className="btn-secondary">
                    Cancel
                  </button>
                  <button onClick={() => onSaveEdit(c.id)} className="btn-primary">
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-line text-sm text-slate-700">{c.content}</p>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={onAdd} className="space-y-2">
        <textarea
          className="input"
          rows={3}
          placeholder="Write a comment…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={!draft.trim()}>
            Post comment
          </button>
        </div>
      </form>
    </div>
  );
}
