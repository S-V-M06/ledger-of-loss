'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to authenticate');
        setLoading(false);
        return;
      }

      if (redirectPath) {
        router.push(redirectPath);
      } else if (data.user?.role === 'admin') {
        router.push('/admin/analytics');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError('A network error occurred. Please try again.');
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Sign In</h2>
          <p className="text-sm text-slate-400 mt-1">Access your security dashboard and scans</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link href="/signup" className="text-sky-400 hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </div>

        {/* Viva & Evaluator Demo Credentials Helper */}
        <div className="mt-6 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400">
          <div className="font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span>⚡ Quick Demo Logins:</span>
            <span className="text-[10px] text-slate-500 font-mono">Password: as in .env</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@ledgerofloss.local', 'AdminPass123!')}
              className="text-left px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 flex justify-between items-center transition"
            >
              <span className="text-amber-400 font-mono">admin@ledgerofloss.local</span>
              <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded font-bold">ADMIN</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('divya@example.com', 'UserPass123!')}
              className="text-left px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 flex justify-between items-center transition"
            >
              <span className="text-emerald-400 font-mono">divya@example.com</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-bold">USER 1</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('arjun@example.com', 'UserPass123!')}
              className="text-left px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 flex justify-between items-center transition"
            >
              <span className="text-sky-400 font-mono">arjun@example.com</span>
              <span className="text-[10px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded font-bold">USER 2</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-slate-400">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
