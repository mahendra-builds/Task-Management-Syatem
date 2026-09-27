import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Logged in');
      const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed';
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 card">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="text-sm text-slate-500">
          Sign in to your Task Management account.
        </p>
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="text-sm text-slate-500">
          No account?{' '}
          <Link to="/register" className="text-brand-600 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
