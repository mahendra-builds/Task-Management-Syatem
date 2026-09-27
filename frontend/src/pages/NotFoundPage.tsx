import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-slate-500">Page not found.</p>
      <Link to="/dashboard" className="btn-primary">
        Go home
      </Link>
    </div>
  );
}
