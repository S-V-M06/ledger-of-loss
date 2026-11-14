'use client';

import { useState, useEffect } from 'react';

interface BreachItem {
  breach_id: number;
  breach_name: string;
  source_name: string;
  breach_date: string;
  severity: string;
  description: string;
  exposure_count: number;
}

export default function AdminBreachesPage() {
  const [breaches, setBreaches] = useState<BreachItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [autoSeedRecords, setAutoSeedRecords] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const loadBreaches = async () => {
    try {
      const res = await fetch('/api/admin/breaches');
      if (res.ok) {
        const data = await res.json();
        setBreaches(data.breaches || []);
      }
    } catch (err) {
      console.error('Failed to load breaches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBreaches();
  }, []);

  const handleCreateBreach = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      // If autoSeedRecords is checked, include mock records for demo users
      const mockRecords = autoSeedRecords
        ? [
            {
              identity_value: 'divya@example.com',
              identity_type: 'email',
              exposed_fields: ['password', 'email'],
              extra: { leaked_via: 'Admin manual upload demo' },
            },
            {
              identity_value: 'arjun@example.com',
              identity_type: 'email',
              exposed_fields: ['phone', 'financial', 'email'],
              extra: { notes: 'Seeded with breach record' },
            },
          ]
        : [];

      const res = await fetch('/api/admin/breaches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          breach_name: name,
          source_name: source,
          breach_date: date,
          severity,
          description,
          records: mockRecords,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.error || 'Failed to create breach', isError: true });
      } else {
        setMessage({
          text: `Successfully created breach "${name}" with ${data.records_inserted} synthetic MongoDB records!`,
          isError: false,
        });
        setName('');
        setSource('');
        setDate('');
        setDescription('');
        loadBreaches();
      }
    } catch (err) {
      setMessage({ text: 'A network error occurred while communicating with the server.', isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white">Breach Catalog & Incident Management</h1>
        <p className="text-sm text-slate-400 mt-1">
          Administer known security incidents. Demonstrates cross-database compensating transactions between PostgreSQL and MongoDB.
        </p>
      </div>

      {/* Cross-Database Compensating Action Callout */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
        <div className="font-semibold text-sky-400 mb-1">Architecture Note: Cross-Database Integrity Pattern</div>
        <p>
          Because SQL and MongoDB have no shared distributed transaction coordinator, this endpoint executes a <strong>compensating transaction pattern</strong>: The breach is written to PostgreSQL <code className="text-slate-400 font-mono">breaches</code> first. If the subsequent MongoDB <code className="text-slate-400 font-mono">breach_records</code> write encounters an error, the system automatically deletes the SQL row, preventing orphan or asymmetric state.
        </p>
      </div>

      {/* Add New Breach Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-white mb-1">Register New Security Breach</h2>
        <p className="text-xs text-slate-400 mb-6">
          Adds a master breach entry in PostgreSQL and optionally populates corresponding hashed documents in MongoDB.
        </p>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-xs ${
              message.isError
                ? 'bg-rose-950/70 border border-rose-800 text-rose-300'
                : 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleCreateBreach} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Breach / Incident Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CloudCorp Customer Leak"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Source Entity / Threat Actor
              </label>
              <input
                type="text"
                required
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. CloudCorp Infrastructure"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Incident Date (Past or Present)
              </label>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Severity Rating
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="low">Low (10 base points)</option>
                <option value="medium">Medium (20 base points)</option>
                <option value="high">High (30 base points)</option>
                <option value="critical">Critical (40 base points)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Incident Description & Exposure Scope
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the vulnerability vector, compromised attributes, and impact..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="autoSeedRecords"
              checked={autoSeedRecords}
              onChange={(e) => setAutoSeedRecords(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="autoSeedRecords" className="text-xs text-slate-300 cursor-pointer">
              Auto-generate synthetic records in MongoDB matched to demo accounts (for live scan testing)
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition disabled:opacity-50"
          >
            {submitting ? 'Registering Breach...' : 'Save Breach & Populate Records'}
          </button>
        </form>
      </div>

      {/* Breaches Catalog Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Registered Incident Catalog</h2>
          <span className="text-xs text-slate-400 font-mono">Count: {breaches.length}</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/70 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Breach Name</th>
                  <th className="px-6 py-3.5">Source</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Severity</th>
                  <th className="px-6 py-3.5">Total User Exposures</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {breaches.map((b) => (
                  <tr key={b.breach_id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono text-sky-400 text-xs">#{b.breach_id}</td>
                    <td className="px-6 py-4 font-semibold text-white">
                      <div>{b.breach_name}</div>
                      {b.description && (
                        <div className="text-xs text-slate-500 font-normal line-clamp-1">{b.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-300">{b.source_name}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(b.breach_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          b.severity === 'critical'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : b.severity === 'high'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : b.severity === 'medium'
                            ? 'bg-yellow-950 text-yellow-300 border-yellow-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {b.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-white">
                      {b.exposure_count} user exposure{b.exposure_count !== 1 ? 's' : ''}
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
