import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Header() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="text-sm text-slate-500">
        <Link to="/dashboard" className="hover:text-brand-600">
          Home
        </Link>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm text-slate-600">
            {user.name}{' '}
            <span className="ml-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
              {user.role}
            </span>
          </span>
        )}
        <button onClick={onLogout} className="btn-secondary">
          Logout
        </button>
      </div>
    </header>
  );
}
