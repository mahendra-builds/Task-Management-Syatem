import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Account created');
      navigate('/login');
    } catch {
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 card">
        <h1 className="text-2xl font-bold">Register</h1>
        <input
          className="input"
          placeholder="Full name"
          value={form.name}
          onChange={onChange('name')}
          required
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange('email')}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password (min 8 chars)"
          minLength={8}
          value={form.password}
          onChange={onChange('password')}
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
