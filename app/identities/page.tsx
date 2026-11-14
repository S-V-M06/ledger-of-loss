'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Identity {
  identity_id: number;
  identity_value: string;
  identity_type: 'email' | 'username';
  verified: boolean;
  verified_at: string | null;
  created_at: string;
  scan_count: number;
  exposure_count: number;
}

interface ScanHistory {
  scan_id: number;
  identity_id: number;
  identity_value: string;
  identity_type: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  exposures_found: number;
}

export default function IdentitiesPage() {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [scans, setScans] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // New identity form
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState<'email' | 'username'>('email');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Scanning state
  const [scanningId, setScanningId] = useState<number | null>(null);
  const [scanMessage, setScanMessage] = useState<{ id: number; text: string; isError?: boolean } | null>(null);

  const loadData = async () => {
    try {
      const [idRes, scanRes] = await Promise.all([
        fetch('/api/identities'),
        fetch('/api/scans'),
      ]);

      if (idRes.ok) {
        const idData = await idRes.json();
        setIdentities(idData.identities || []);
      }
      if (scanRes.ok) {
        const scanData = await scanRes.json();
        setScans(scanData.scans || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/identities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity_value: newValue,
          identity_type: newType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to add identity');
      } else {
        setFormSuccess(`Added "${newValue}". Verify ownership to run scans.`);
        setNewValue('');
        loadData();
      }
    } catch (err) {
      setFormError('Failed to communicate with server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (identityId: number) => {
    try {
      const res = await fetch(`/api/identities/${identityId}/verify`, { method: 'POST' });
      if (res.ok) {
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || 'Verification failed');
      }
    } catch (err) {
      alert('Network error while verifying');
    }
  };

  const handleDelete = async (identityId: number) => {
    if (!confirm('Are you sure? Deleting this identity cascades and deletes all related exposures and recovery actions.')) {
      return;
    }

    try {
      const res = await fetch(`/api/identities/${identityId}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || 'Delete failed');
      }
    } catch (err) {
      alert('Network error while deleting');
    }
  };

  const handleScan = async (identityId: number) => {
    setScanningId(identityId);
    setScanMessage(null);

    try {
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity_id: identityId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setScanMessage({ id: identityId, text: data.error || 'Scan failed', isError: true });
      } else {
        setScanMessage({
          id: identityId,
          text: `Scan finished! Found ${data.exposures_found} exposure(s) (${data.new_exposures} new).`,
          isError: false,
        });
        loadData();
      }
    } catch (err) {
      setScanMessage({ id: identityId, text: 'Scan failed due to a network error', isError: true });
    } finally {
      setScanningId(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white">Digital Identities & Scans</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your registered emails and usernames. Trigger ACID breach scans against known security incidents.
        </p>
      </div>

      {/* Register Identity Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-white mb-1">Add New Identity</h2>
        <p className="text-xs text-slate-400 mb-4">
          All added identities start as unverified. The database strictly rejects scans until ownership is confirmed.
        </p>

        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs">
            {formError}
          </div>
        )}
        {formSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs">
            {formSuccess}
          </div>
        )}

        <form onSubmit={handleAddIdentity} className="flex flex-col sm:flex-row gap-3">
          <div className="sm:w-44">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="email">Email Address</option>
              <option value="username">Online Username</option>
            </select>
          </div>

          <div className="flex-1">
            <input
              type={newType === 'email' ? 'email' : 'text'}
              required
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={newType === 'email' ? 'e.g. personal@example.com' : 'e.g. handle_or_gamertag'}
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Register Identity'}
          </button>
        </form>
      </div>

      {/* Identities Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Your Registered Identities</h2>
          <span className="text-xs text-slate-400 font-mono">Total: {identities.length}</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading identities...</div>
        ) : identities.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No identities registered yet. Add an email or username above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/70 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Identifier</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Ownership Status</th>
                  <th className="px-6 py-3.5">Exposures Found</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {identities.map((item) => (
                  <tr key={item.identity_id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-mono font-medium text-white">
                      {item.identity_value}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {item.identity_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.verified ? (
                        <div className="inline-flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold">
                          <span>✓ Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-400 text-xs font-semibold">Unverified</span>
                          <button
                            onClick={() => handleVerify(item.identity_id)}
                            className="px-2.5 py-1 text-xs rounded bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 font-medium transition"
                          >
                            Confirm I own this
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.exposure_count > 0 ? (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          {item.exposure_count} Breach Match{item.exposure_count > 1 ? 'es' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">0 exposures</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleScan(item.identity_id)}
                        disabled={!item.verified || scanningId === item.identity_id}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-30 disabled:cursor-not-allowed bg-sky-600 hover:bg-sky-500 text-white"
                        title={!item.verified ? 'Database trigger T1 requires verification before scan' : ''}
                      >
                        {scanningId === item.identity_id ? 'Scanning...' : 'Scan Now'}
                      </button>

                      <button
                        onClick={() => handleDelete(item.identity_id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {scanMessage && (
          <div
            className={`p-4 border-t text-xs flex justify-between items-center ${
              scanMessage.isError
                ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                : 'bg-sky-950/60 border-sky-800 text-sky-300'
            }`}
          >
            <span>{scanMessage.text}</span>
            <Link href="/dashboard" className="underline font-semibold hover:text-white">
              View on Dashboard &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Scan History Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Scan Audit Log (PostgreSQL scan_requests)</h2>
          <p className="text-xs text-slate-400">Complete execution history enforced by database triggers</p>
        </div>

        {scans.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">No scans logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Scan ID</th>
                  <th className="px-6 py-3">Target Identity</th>
                  <th className="px-6 py-3">Started At</th>
                  <th className="px-6 py-3">Completed At</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Exposures Found</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {scans.map((s) => (
                  <tr key={s.scan_id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-3 text-sky-400">#{s.scan_id}</td>
                    <td className="px-6 py-3">{s.identity_value}</td>
                    <td className="px-6 py-3 text-slate-400">{new Date(s.started_at).toLocaleString()}</td>
                    <td className="px-6 py-3 text-slate-400">
                      {s.completed_at ? new Date(s.completed_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                          s.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : s.status === 'failed'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-200">{s.exposures_found}</td>
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
