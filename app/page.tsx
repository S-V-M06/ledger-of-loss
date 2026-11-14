import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === 'admin') {
      redirect('/admin/analytics');
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <div className="py-12 md:py-20 flex flex-col items-center text-center max-w-4xl mx-auto">
      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/60 text-sky-400 text-xs font-medium mb-6">
        <span>PostgreSQL 16 + MongoDB 7</span>
        <span>&bull;</span>
        <span>DBMS Level 3 Experiential Learning</span>
      </div>

      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
        Turn Breach Panic into{' '}
        <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
          Measurable Recovery
        </span>
      </h1>

      <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
        Ledger of Loss is a privacy-first exposure navigator. Register verified identities, scan against known breach databases using cryptographic hashes, receive transparent risk scores, and tick off targeted remediation steps.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
        <Link
          href="/signup"
          className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition shadow-lg shadow-sky-500/20 text-center"
        >
          Get Started (Free)
        </Link>
        <Link
          href="/login"
          className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition text-center"
        >
          Sign In to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-2xl mb-3">🔒</div>
          <h3 className="font-semibold text-white mb-2">Zero-Exposure Scanning</h3>
          <p className="text-sm text-slate-400">
            Searches MongoDB breach registries via SHA-256 hashes. Triggers strictly prevent scans on unverified identities.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-2xl mb-3">📐</div>
          <h3 className="font-semibold text-white mb-2">Transparent Risk Formula</h3>
          <p className="text-sm text-slate-400">
            Calculated at the database level with severity baselines, 24-month recency bonuses, and weighted data types.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-2xl mb-3">📋</div>
          <h3 className="font-semibold text-white mb-2">Actionable Remediation</h3>
          <p className="text-sm text-slate-400">
            Automatically maps exposures to curated MongoDB playbooks, creating an interactive, trackable checklist.
          </p>
        </div>
      </div>
    </div>
  );
}
