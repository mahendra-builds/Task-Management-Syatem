import { useParams } from 'react-router-dom';

export function ProjectDetailPage() {
  const { id } = useParams();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Project {id}</h1>
      <p className="text-slate-500">Project detail will be implemented in Phase 4.</p>
    </div>
  );
}
