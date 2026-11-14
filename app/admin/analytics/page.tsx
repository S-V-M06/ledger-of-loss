'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading analytics:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-slate-400">Loading system threat analytics...</div>;
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white">Administrative Intelligence & Query Showcase</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
              Admin Exclusive
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time execution of course-required analytical queries (Q2 through Q8) across PostgreSQL and MongoDB.
          </p>
        </div>
      </div>

      {/* KPI Cards: Q3 & Q6 Privacy-Preserving Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
            <span>High Risk Concentration</span>
            <span className="font-mono text-sky-400 text-[10px]">Q3 (HAVING)</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">
            {data?.q3_having_high_critical?.users_count_with_multiple_high_critical_exposures ?? 0}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Anonymous users with &ge; 2 high or critical risk exposures (Privacy safe: no personal IDs exposed).
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
            <span>Unscanned Verified Identities</span>
            <span className="font-mono text-sky-400 text-[10px]">Q6 (NOT EXISTS)</span>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {data?.q6_unscanned_verified?.length ?? 0}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Confirmed identities awaiting initial scan execution in <code className="font-mono text-slate-400 text-[11px]">scan_requests</code>.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
            <span>Audit Activity Logged</span>
            <span className="font-mono text-sky-400 text-[10px]">Q7 (Pipeline)</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            {(data?.q7_mongo_pipeline?.events_per_day || []).reduce((acc: number, cur: any) => acc + cur.count, 0)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Append-only security audit log entries tracked in MongoDB.
          </p>
        </div>
      </div>

      {/* Q2: Exposures & Average Risk Per Breach */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Q2: Breach Exposure & Average Risk Summary</h2>
            <p className="text-xs text-slate-400">
              Query: <code className="text-sky-400 font-mono text-[11px]">GROUP BY b.breach_id ORDER BY total_exposures DESC</code>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Breach Name</th>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Incident Date</th>
                <th className="px-6 py-3">Matches Found</th>
                <th className="px-6 py-3">Average Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {(data?.q2_breach_summary || []).map((b: any) => (
                <tr key={b.breach_id} className="hover:bg-slate-800/30">
                  <td className="px-6 py-3 font-semibold text-white">{b.breach_name}</td>
                  <td className="px-6 py-3 capitalize">{b.severity}</td>
                  <td className="px-6 py-3 text-slate-400">{new Date(b.breach_date).toLocaleDateString()}</td>
                  <td className="px-6 py-3 font-mono text-sky-400 font-bold">{b.total_exposures}</td>
                  <td className="px-6 py-3 font-mono text-amber-400">{b.average_risk_score} / 100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Q4 Subquery & Q5 Data Types Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Q4: Above Average Risk Exposures */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">Q4: Exposures Above Global Mean Risk</h2>
            <p className="text-xs text-slate-400">
              Query: <code className="text-sky-400 font-mono text-[11px]">WHERE risk_score &gt; (SELECT AVG(risk_score) FROM exposures)</code>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Breach</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Global Avg</th>
                  <th className="px-6 py-3">Delta Above Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {(data?.q4_above_average || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-slate-500">
                      No exposures currently exceed the global average.
                    </td>
                  </tr>
                ) : (
                  (data?.q4_above_average || []).map((row: any) => (
                    <tr key={row.exposure_id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-3 font-medium text-white">{row.breach_name}</td>
                      <td className="px-6 py-3 font-mono font-bold text-rose-400">{row.risk_score}</td>
                      <td className="px-6 py-3 font-mono text-slate-400">{row.global_average_risk}</td>
                      <td className="px-6 py-3 font-mono text-emerald-400">+{row.points_above_average} pts</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Q5: Data Type Exposure Frequency */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">Q5: Risk Profile Per Data Type</h2>
            <p className="text-xs text-slate-400">
              Query: <code className="text-sky-400 font-mono text-[11px]">FROM data_types JOIN exposure_data_types JOIN exposures</code>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Data Type</th>
                  <th className="px-6 py-3">Weight</th>
                  <th className="px-6 py-3">Compromised</th>
                  <th className="px-6 py-3">Avg Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {(data?.q5_data_types || []).map((dt: any) => (
                  <tr key={dt.data_type_id} className="hover:bg-slate-800/30">
                    <td className="px-6 py-3 font-medium text-white capitalize">{dt.data_type_name.replace('_', ' ')}</td>
                    <td className="px-6 py-3 font-mono text-slate-400">+{dt.assigned_weight}</td>
                    <td className="px-6 py-3 font-mono text-sky-400 font-semibold">{dt.occurrences_in_exposures}</td>
                    <td className="px-6 py-3 font-mono text-amber-400">{dt.average_exposure_risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Q7: MongoDB Aggregation Pipelines */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Q7: MongoDB Aggregation Pipeline on audit_logs</h2>
            <p className="text-xs text-slate-400">
              Stages: <code className="text-sky-400 font-mono text-[11px]">$match &bull; $unwind &bull; $group &bull; $lookup &bull; $sort &bull; $limit</code>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Top Playbooks */}
          <div className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Most Frequently Recommended Playbooks ($lookup)
            </h3>
            <div className="space-y-2">
              {(data?.q7_mongo_pipeline?.top_recommended_playbooks || []).length === 0 ? (
                <div className="text-xs text-slate-500 py-4">No playbook recommendations logged yet.</div>
              ) : (
                (data?.q7_mongo_pipeline?.top_recommended_playbooks || []).map((pb: any) => (
                  <div
                    key={pb.playbook_id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs"
                  >
                    <span className="font-medium text-slate-200 truncate pr-2">{pb.title}</span>
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-sky-400 whitespace-nowrap">
                      {pb.times_recommended} issued
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Audit Events per Type per Day */}
          <div className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Daily Audit Event Frequency ($dateToString + $group)
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {(data?.q7_mongo_pipeline?.events_per_day || []).length === 0 ? (
                <div className="text-xs text-slate-500 py-4">No audit events found.</div>
              ) : (
                (data?.q7_mongo_pipeline?.events_per_day || []).map((e: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-slate-950 border border-slate-800 flex justify-between items-center text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-slate-500 text-[11px]">{e.day}</span>
                      <span className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-slate-900 text-slate-300 border border-slate-700">
                        {e.event_type}
                      </span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">{e.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
