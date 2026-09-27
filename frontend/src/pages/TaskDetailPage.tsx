import { useParams } from 'react-router-dom';

export function TaskDetailPage() {
  const { id } = useParams();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Task {id}</h1>
      <p className="text-slate-500">Task detail will be implemented in Phase 5.</p>
    </div>
  );
}
