'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface DataType {
  data_type_id: number;
  name: string;
  weight: number;
}

interface PlaybookStep {
  order: number;
  text: string;
  estimated_minutes: number;
}

interface RecoveryAction {
  action_id: number;
  playbook_ref: string;
  title: string;
  priority: number;
  status: 'pending' | 'completed' | 'dismissed';
  created_at: string;
  completed_at: string | null;
  playbook: {
    summary: string;
    steps: PlaybookStep[];
    tags: string[];
  } | null;
}

interface ExposureDetail {
  exposure_id: number;
  identity_id: number;
  identity_value: string;
  identity_type: string;
  breach_id: number;
  breach_name: string;
  source_name: string;
  breach_date: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  breach_description: string;
  risk_score: number;
  risk_level: string;
  discovered_at: string;
  is_recent: boolean;
}

export default function ExposureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const exposureId = params?.id as string;

  const [exposure, setExposure] = useState<ExposureDetail | null>(null);
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [actions, setActions] = useState<RecoveryAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadExposure = async () => {
    try {
      const res = await fetch(`/api/exposures/${exposureId}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to load exposure details');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setExposure(data.exposure);
      setDataTypes(data.data_types || []);
      setActions(data.recovery_actions || []);
    } catch (err) {
      setError('A network error occurred while loading exposure details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (exposureId) {
      loadExposure();
    }
  }, [exposureId]);

  const handleToggleAction = async (actionId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';

    try {
      const res = await fetch(`/api/recovery-actions/${actionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        loadExposure();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update action');
      }
    } catch (err) {
      alert('Network error updating action');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400">Loading exposure details...</div>;
  }

  if (error || !exposure) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="text-rose-400 font-semibold">{error || 'Exposure not found'}</div>
        <Link href="/dashboard" className="inline-block text-sm text-sky-400 hover:underline">
          &larr; Return to Dashboard
        </Link>
      </div>
    );
  }

  // Calculate formula values for viva explanation
  const severityBase =
    exposure.severity === 'critical' ? 40 : exposure.severity === 'high' ? 30 : exposure.severity === 'medium' ? 20 : 10;
  const dataTypesSum = dataTypes.reduce((sum, dt) => sum + dt.weight, 0);
  const recencyBonus = exposure.is_recent ? 10 : 0;

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

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header & Breadcrumbs */}
      <div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
          <Link href="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-300">Exposures</span>
          <span>/</span>
          <span className="text-sky-400">#{exposure.exposure_id}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white">{exposure.breach_name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getRiskBadge(
                  exposure.risk_level
                )}`}
              >
                {exposure.risk_level} Risk
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Source: <span className="text-slate-300 font-medium">{exposure.source_name}</span> &bull; Discovered: {new Date(exposure.discovered_at).toLocaleDateString()}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Affected Identity</div>
            <div className="font-mono text-sm font-semibold text-white">{exposure.identity_value}</div>
          </div>
        </div>
      </div>

      {/* Grid: Risk Calculation & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Calculation Breakdown Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Risk Score Engine
              </h2>
              <span className="text-xs text-slate-500 font-mono">SQL Function</span>
            </div>

            <div className="text-center py-4 bg-slate-950 rounded-lg border border-slate-800/80 mb-6">
              <div className="text-5xl font-black text-white">{exposure.risk_score}</div>
              <div className="text-xs text-slate-400 mt-1">Out of 100 Points</div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Severity Base ({exposure.severity})</span>
                <span className="font-mono font-bold text-white">+{severityBase} pts</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Exposed Data Types ({dataTypes.length} types)</span>
                <span className="font-mono font-bold text-white">+{dataTypesSum} pts</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Recency Bonus (&lt; 24 months)</span>
                <span className="font-mono font-bold text-white">+{recencyBonus} pts</span>
              </div>
              <div className="flex justify-between items-center pt-2 font-semibold">
                <span className="text-slate-200">Bounded Final Score</span>
                <span className="font-mono font-bold text-sky-400">{exposure.risk_score} / 100</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-6 pt-4 border-t border-slate-800 leading-relaxed">
            Deterministic formula: <br />
            <code className="text-slate-400 font-mono text-[10px]">
              LEAST(100, severity_base + SUM(weights) + recency_bonus)
            </code>
          </p>
        </div>

        {/* Breach Description & Exposed Data Types */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
              Breach Synopsis
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {exposure.breach_description || 'No detailed incident summary provided.'}
            </p>
            <div className="flex items-center space-x-4 mt-3 text-xs text-slate-400">
              <div>Incident Date: <span className="text-white font-medium">{new Date(exposure.breach_date).toLocaleDateString()}</span></div>
              <div>&bull;</div>
              <div>Recency: <span className="text-white font-medium">{exposure.is_recent ? 'Recent (< 24 mos)' : 'Historical'}</span></div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3">
              Exposed Data Types & Assigned Weights
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {dataTypes.map((dt) => (
                <div
                  key={dt.data_type_id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <span className="text-xs font-medium text-slate-200 capitalize">
                    {dt.name.replace('_', ' ')}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-sky-400">
                    +{dt.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Recovery Playbooks Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recommended Recovery Actions</h2>
            <p className="text-xs text-slate-400">
              Matched from MongoDB guidance playbooks based on your exposed data fields
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {actions.filter((a) => a.status === 'completed').length} / {actions.length} Completed
          </span>
        </div>

        {actions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No recovery actions required for this exposure.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {actions.map((act) => {
              const isDone = act.status === 'completed';
              return (
                <div key={act.action_id} className={`p-6 transition ${isDone ? 'bg-slate-950/40' : 'hover:bg-slate-800/20'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3.5 flex-1">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => handleToggleAction(act.action_id, act.status)}
                        className="mt-1 h-5 w-5 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className={`text-base font-semibold ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                            {act.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-amber-400 border border-slate-700">
                            Priority {act.priority}
                          </span>
                        </div>
                        {act.playbook?.summary && (
                          <p className="text-xs text-slate-400 mt-1">{act.playbook.summary}</p>
                        )}

                        {/* Step-by-step checklist breakdown */}
                        {act.playbook?.steps && act.playbook.steps.length > 0 && (
                          <div className="mt-4 pl-4 border-l-2 border-slate-800 space-y-2">
                            {act.playbook.steps.map((st) => (
                              <div key={st.order} className="text-xs text-slate-300 flex items-start space-x-2">
                                <span className="font-mono text-sky-400 font-bold">{st.order}.</span>
                                <span>{st.text}</span>
                                <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                  (~{st.estimated_minutes} min)
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                          isDone
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {act.status}
                      </span>
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
