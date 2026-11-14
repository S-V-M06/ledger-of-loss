'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        return { user: null };
      })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  const navLinkClass = (path: string) => {
    const isActive = pathname === path || pathname.startsWith(`${path}/`);
    return `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
      isActive
        ? 'bg-slate-800 text-sky-400 font-semibold'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href={user ? (user.role === 'admin' ? '/admin/analytics' : '/dashboard') : '/'} className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              🛡️ Ledger of Loss
            </span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/dashboard" className={navLinkClass('/dashboard')}>
                Dashboard
              </Link>
              <Link href="/identities" className={navLinkClass('/identities')}>
                Identities & Scans
              </Link>
              <Link href="/actions" className={navLinkClass('/actions')}>
                Recovery Actions
              </Link>
              <Link href="/guidance" className={navLinkClass('/guidance')}>
                Guidance Library
              </Link>

              {user.role === 'admin' && (
                <>
                  <span className="text-slate-600 px-1">|</span>
                  <Link href="/admin/analytics" className={navLinkClass('/admin/analytics')}>
                    Analytics
                  </Link>
                  <Link href="/admin/breaches" className={navLinkClass('/admin/breaches')}>
                    Breaches
                  </Link>
                  <Link href="/admin/playbooks" className={navLinkClass('/admin/playbooks')}>
                    Playbooks
                  </Link>
                  <Link href="/admin/audit" className={navLinkClass('/admin/audit')}>
                    Audit Logs
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-slate-200">{user.name}</div>
                    <div className="text-xs text-slate-400 flex items-center justify-end space-x-1">
                      <span>{user.email}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                            : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded border border-slate-700 transition"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="text-sm text-slate-200 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800 transition"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="text-sm bg-sky-600 hover:bg-sky-500 text-white font-medium px-3.5 py-1.5 rounded-md transition"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
