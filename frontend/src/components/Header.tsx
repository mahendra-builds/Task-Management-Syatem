import { Link, useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('tms-token');
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
        <button onClick={logout} className="btn-secondary">
          Logout
        </button>
      </div>
    </header>
  );
}
