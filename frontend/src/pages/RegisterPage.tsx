import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);

  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created');
      navigate('/dashboard');
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed';
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 card">
        <h1 className="text-2xl font-bold">Register</h1>
        <p className="text-sm text-slate-500">Create your task management account.</p>
        <input
          className="input"
          placeholder="Full name"
          value={form.name}
          onChange={onChange('name')}
          autoComplete="name"
          required
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange('email')}
          autoComplete="email"
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password (min 8 chars, A-z, 0-9)"
          minLength={8}
          value={form.password}
          onChange={onChange('password')}
          autoComplete="new-password"
          required
        />
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create account'}
        </button>
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
