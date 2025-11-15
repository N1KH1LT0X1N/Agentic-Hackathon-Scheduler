'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

interface Props {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    teamName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const payload = mode === 'login' ? { email: form.email, password: form.password } : form;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!response.ok) {
      const json = await response.json();
      setError(json.error ?? 'Unable to authenticate');
      return;
    }
    router.push('/command-center');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'signup' && (
        <div>
          <label className="text-sm text-slate-300">Team name</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-white"
            value={form.teamName}
            onChange={(event) => setForm({ ...form, teamName: event.target.value })}
            required
          />
        </div>
      )}
      {mode === 'signup' && (
        <div>
          <label className="text-sm text-slate-300">Your name</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-white"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </div>
      )}
      <div>
        <label className="text-sm text-slate-300">Email</label>
        <input
          type="email"
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-white"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
      </div>
      <div>
        <label className="text-sm text-slate-300">Password</label>
        <input
          type="password"
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-white"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
      </div>
      {error && <p className="text-sm text-rose-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-emerald-950 disabled:opacity-50"
      >
        {loading ? 'Processing…' : mode === 'login' ? 'Log in' : 'Create team'}
      </button>
    </form>
  );
}
