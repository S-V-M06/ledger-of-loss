'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PlaybookStep {
  order: number;
  text: string;
  estimated_minutes: number;
}

interface ActionItem {
  action_id: number;
  exposure_id: number;
  playbook_ref: string;
  title: string;
  priority: number;
  status: 'pending' | 'completed' | 'dismissed';
  created_at: string;
  completed_at: string | null;
  breach_name: string;
  severity: string;
  identity_value: string;
  identity_type: string;
  playbook: {
    summary: string;
    steps: PlaybookStep[];
    tags: string[];
  } | null;
}

export default function RecoveryActionsPage() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadActions = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/api/recovery-actions?status=${statusFilter}` : '/api/recovery-actions';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setActions(data.actions || []);
      }
    } catch (err) {
      console.error('Failed to load actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, [statusFilter]);

  const handleUpdateStatus = async (actionId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/recovery-actions/${actionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadActions();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update action');
      }
    } catch (err) {
      alert('Network error updating action');
    }
  };

  const completedCount = actions.filter((a) => a.status === 'completed').length;
  const pendingCount = actions.filter((a) => a.status === 'pending').length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Recovery Action Checklist</h1>
          <p className="text-sm text-slate-400 mt-1">
            Step-by-step remediation procedures dynamically matched from MongoDB playbooks to mitigate your leaked data types.
          </p>
        </div>
        <div className="text-right">
          <Link
            href="/dashboard"
            className="text-xs text-sky-400 hover:underline font-semibold"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          {[
            { label: 'Pending Tasks', value: 'pending' },
            { label: 'Completed', value: 'completed' },
            { label: 'Dismissed', value: 'dismissed' },
            { label: 'All Tasks', value: '' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === tab.value
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {actions.length} action{actions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Actions List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading recovery actions...</div>
        ) : actions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="text-3xl">🎉</div>
            <p className="text-sm font-semibold text-white">No Actions Found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {statusFilter === 'pending'
                ? 'All pending tasks are cleared! Your security posture is currently in good standing.'
                : 'No actions match the selected filter tab.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {actions.map((act) => {
              const isDone = act.status === 'completed';
              const isDismissed = act.status === 'dismissed';
              const isExpanded = expandedId === act.action_id;

              return (
                <div
                  key={act.action_id}
                  className={`p-6 transition ${
                    isDone ? 'bg-slate-950/30' : isDismissed ? 'opacity-60 bg-slate-950/40' : 'hover:bg-slate-800/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Checkbox and Title */}
                    <div className="flex items-start space-x-3.5 flex-1">
                      <input
                        type="checkbox"
                        checked={isDone}
                        disabled={isDismissed}
                        onChange={() => handleUpdateStatus(act.action_id, isDone ? 'pending' : 'completed')}
                        className="mt-1 h-5 w-5 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500 cursor-pointer disabled:opacity-30"
                      />

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`text-base font-semibold ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                            {act.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-amber-400 border border-slate-700">
                            Priority {act.priority}
                          </span>
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                          <span>
                            Incident: <strong className="text-slate-300">{act.breach_name}</strong>
                          </span>
                          <span>&bull;</span>
                          <span>
                            Identity: <code className="text-sky-400 font-mono text-[11px]">{act.identity_value}</code>
                          </span>
                          <span>&bull;</span>
                          <Link
                            href={`/exposures/${act.exposure_id}`}
                            className="text-sky-400 hover:underline font-medium"
                          >
                            View Exposure &rarr;
                          </Link>
                        </div>

                        {/* Playbook Summary */}
                        {act.playbook?.summary && (
                          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                            {act.playbook.summary}
                          </p>
                        )}

                        {/* Expandable Step-by-Step Guidance */}
                        {act.playbook?.steps && act.playbook.steps.length > 0 && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : act.action_id)}
                              className="text-xs text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center space-x-1"
                            >
                              <span>{isExpanded ? 'Hide Guided Steps' : `View ${act.playbook.steps.length} Step-by-Step Instructions`}</span>
                              <span>{isExpanded ? '▲' : '▼'}</span>
                            </button>

                            {isExpanded && (
                              <div className="mt-3 pl-4 border-l-2 border-sky-800/80 space-y-2 py-1">
                                {act.playbook.steps.map((st) => (
                                  <div key={st.order} className="text-xs text-slate-300 flex items-start space-x-2">
                                    <span className="font-mono text-sky-400 font-bold">{st.order}.</span>
                                    <span className="flex-1">{st.text}</span>
                                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                      ~{st.estimated_minutes} min
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status & Options Dropdown */}
                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          isDone
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : isDismissed
                            ? 'bg-slate-800 text-slate-500 border border-slate-700'
                            : 'bg-sky-950 text-sky-400 border border-sky-800'
                        }`}
                      >
                        {act.status}
                      </span>

                      {!isDismissed ? (
                        <button
                          onClick={() => handleUpdateStatus(act.action_id, 'dismissed')}
                          className="text-[11px] text-slate-500 hover:text-slate-300 transition"
                        >
                          Dismiss
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(act.action_id, 'pending')}
                          className="text-[11px] text-sky-400 hover:underline transition"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
