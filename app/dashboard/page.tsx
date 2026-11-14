'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardSummary {
  total_exposures: number;
  high_count: number;
  critical_count: number;
  overall_score: number;
  pending_actions_count: number;
  updated_at: string;
}

interface ExposureRow {
  exposure_id: number;
  identity_id: number;
  identity_value: string;
  breach_name: string;
  breach_date: string;
  severity: string;
  risk_score: number;
  risk_level: string;
  discovered_at: string;
  exposed_data_types: string;
  pending_recovery_actions_count: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [exposures, setExposures] = useState<ExposureRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('risk_desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (levelFilter) params.set('level', levelFilter);
      if (sortOrder) params.set('sort', sortOrder);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await fetch(`/api/dashboard?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setExposures(data.exposures || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [levelFilter, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDashboard();
  };

  const getRiskBadge = (lvl: string) => {
    switch (lvl?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'high':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'medium':
        return 'bg-yellow-950 text-yellow-300 border-yellow-800';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return 'text-rose-400 font-bold';
      case 'high':
        return 'text-amber-400 font-semibold';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-emerald-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Security & Exposure Posture</h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated exposure intelligence rendered live from the <code className="text-sky-400 font-mono text-xs">user_security_dashboard</code> SQL view.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/identities"
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition"
          >
            Manage Identities & Scan &rarr;
          </Link>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Risk Posture</div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{summary?.overall_score ?? 0}</span>
            <span className="text-xs text-slate-500 font-medium">/ 100 max</span>
          </div>
          <div className="mt-3">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                (summary?.overall_score ?? 0) > 75
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : (summary?.overall_score ?? 0) > 50
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : (summary?.overall_score ?? 0) > 25
                  ? 'bg-yellow-950 text-yellow-300 border-yellow-800'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}
            >
              {(summary?.overall_score ?? 0) > 75
                ? 'Critical Threat'
                : (summary?.overall_score ?? 0) > 50
                ? 'High Risk'
                : (summary?.overall_score ?? 0) > 25
                ? 'Moderate Risk'
                : 'Low / Managed'}
            </span>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Exposures</div>
          <div className="text-3xl font-extrabold text-white mt-2">{summary?.total_exposures ?? 0}</div>
          <p className="text-xs text-slate-500 mt-2">Across all scanned verified identities</p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High & Critical</div>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">
            {(summary?.high_count ?? 0) + (summary?.critical_count ?? 0)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {summary?.critical_count ?? 0} Critical &bull; {summary?.high_count ?? 0} High
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Playbook Tasks</div>
          <div className="text-3xl font-extrabold text-sky-400 mt-2">{summary?.pending_actions_count ?? 0}</div>
          <div className="mt-2">
            <Link href="/actions" className="text-xs text-sky-400 hover:underline">
              View Checklist &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Risk Level Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <span className="text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider">Tier:</span>
          {[
            { label: 'All', value: '' },
            { label: 'Critical', value: 'critical' },
            { label: 'High', value: 'high' },
            { label: 'Medium', value: 'medium' },
            { label: 'Low', value: 'low' },
          ].map((pill) => (
            <button
              key={pill.value}
              onClick={() => setLevelFilter(pill.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                levelFilter === pill.value
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search breach or data type..."
              className="w-full pl-3 pr-8 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  loadDashboard();
                }}
                className="absolute right-2.5 top-1.5 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </form>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="risk_desc">Sort: Risk (Highest first)</option>
            <option value="risk_asc">Sort: Risk (Lowest first)</option>
            <option value="date_desc">Sort: Breach Date (Newest first)</option>
            <option value="date_asc">Sort: Breach Date (Oldest first)</option>
            <option value="name_asc">Sort: Breach Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Exposures Table from SQL View */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Known Exposures</h2>
            <p className="text-xs text-slate-400">
              Query source: <span className="font-mono text-sky-400">SELECT * FROM user_security_dashboard</span>
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Count: {exposures.length}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading security posture...</div>
        ) : exposures.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="text-3xl">🛡️</div>
            <p className="text-sm font-semibold text-white">No Exposures Found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {levelFilter || searchQuery
                ? 'No breach records match your current filter criteria.'
                : 'No exposures logged yet. Register an identity and trigger a breach scan.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/70 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Breach Name</th>
                  <th className="px-6 py-3.5">Affected Identity</th>
                  <th className="px-6 py-3.5">Severity</th>
                  <th className="px-6 py-3.5">Risk Score</th>
                  <th className="px-6 py-3.5">Exposed Data Types (string_agg)</th>
                  <th className="px-6 py-3.5">Pending Tasks</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {exposures.map((exp) => (
                  <tr key={exp.exposure_id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div>{exp.breach_name}</div>
                      <div className="text-xs text-slate-500 font-normal">
                        Date: {new Date(exp.breach_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                      {exp.identity_value}
                    </td>
                    <td className="px-6 py-4 capitalize text-xs">
                      <span className={getSeverityBadge(exp.severity)}>{exp.severity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-white">{exp.risk_score}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRiskBadge(
                            exp.risk_level
                          )}`}
                        >
                          {exp.risk_level}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-xs">
                      <div className="truncate" title={exp.exposed_data_types}>
                        {exp.exposed_data_types}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {exp.pending_recovery_actions_count > 0 ? (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-950 text-sky-400 border border-sky-800">
                          {exp.pending_recovery_actions_count} Open
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">All Clear</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/exposures/${exp.exposure_id}`}
                        className="inline-flex items-center px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700 transition"
                      >
                        Inspect &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
