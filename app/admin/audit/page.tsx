'use client';

import { useState, useEffect } from 'react';

interface AuditLog {
  _id: string;
  ts: string;
  event_type: string;
  user_id: number;
  role: 'user' | 'admin';
  details: Record<string, any>;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [selectedDetails, setSelectedDetails] = useState<Record<string, any> | null>(null);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const url = eventTypeFilter
        ? `/api/admin/audit?event_type=${encodeURIComponent(eventTypeFilter)}`
        : '/api/admin/audit';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [eventTypeFilter]);

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'signup':
      case 'login':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'scan_completed':
      case 'recommendations_issued':
        return 'bg-sky-950 text-sky-300 border-sky-800';
      case 'scan_failed':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'admin_breach_added':
      case 'admin_playbook_changed':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-white">Security Audit & Append-Only Log Trail</h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-emerald-400 border border-slate-700">
            MongoDB audit_logs
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Chronological security audit trail recording authentications, scan runs, recommendations, and administrative mutations.
        </p>
      </div>

      {/* Filter Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Filter Event:
          </label>
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">All Security Events</option>
            <option value="signup">signup</option>
            <option value="login">login</option>
            <option value="identity_added">identity_added</option>
            <option value="identity_verified">identity_verified</option>
            <option value="scan_completed">scan_completed</option>
            <option value="scan_failed">scan_failed</option>
            <option value="recommendations_issued">recommendations_issued</option>
            <option value="action_completed">action_completed</option>
            <option value="admin_breach_added">admin_breach_added</option>
            <option value="admin_playbook_changed">admin_playbook_changed</option>
          </select>
        </div>

        <button
          onClick={loadAuditLogs}
          className="text-xs px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          ↻ Refresh Trail
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading security audit records...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No audit records match the current filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3 font-sans">Timestamp (UTC)</th>
                  <th className="px-6 py-3 font-sans">Event Type</th>
                  <th className="px-6 py-3 font-sans">User ID</th>
                  <th className="px-6 py-3 font-sans">Role</th>
                  <th className="px-6 py-3 font-sans text-right">Details Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-3 text-slate-400">
                      {new Date(log.ts).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getEventBadge(
                          log.event_type
                        )}`}
                      >
                        {log.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sky-400">#{log.user_id}</td>
                    <td className="px-6 py-3 uppercase">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.role === 'admin' ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        {log.role}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-sans">
                      <button
                        onClick={() => setSelectedDetails(log.details)}
                        className="text-xs text-sky-400 hover:text-sky-300 underline font-mono"
                      >
                        Inspect JSON
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details JSON Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-sans">Audit Event Metadata (BSON Details)</h3>
              <button
                onClick={() => setSelectedDetails(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-emerald-400 overflow-x-auto max-h-80 font-mono">
              {JSON.stringify(selectedDetails, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
