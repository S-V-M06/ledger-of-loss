'use client';

import { useState, useEffect } from 'react';

interface PlaybookStep {
  order: number;
  text: string;
  estimated_minutes: number;
}

interface Playbook {
  _id: string;
  title: string;
  summary: string;
  applies_to: {
    data_types: string[];
    min_severity_rank: number;
  };
  priority: number;
  steps: PlaybookStep[];
  tags: string[];
  score?: number;
}

export default function GuidanceSearchPage() {
  const [query, setQuery] = useState('');
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const searchPlaybooks = async (searchTerm = '') => {
    setLoading(true);
    try {
      const url = searchTerm ? `/api/guidance?q=${encodeURIComponent(searchTerm)}` : '/api/guidance';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPlaybooks(data.playbooks || []);
      }
    } catch (err) {
      console.error('Failed to search playbooks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchPlaybooks();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchPlaybooks(query);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    searchPlaybooks(tag);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-white">Remediation Guidance Library</h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-sky-400 border border-slate-700">
            MongoDB Text Search
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Explore curated cybersecurity playbooks indexed with MongoDB weighted text scoring across titles, summaries, tags, and step instructions.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by threat (e.g. password, mfa, financial, ssn, phishing, darkweb)..."
              className="w-full pl-4 pr-10 py-3 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  searchPlaybooks('');
                }}
                className="absolute right-3 top-3 text-slate-500 hover:text-white text-sm"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition"
          >
            Search
          </button>
        </form>

        {/* Quick Tag Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Popular:</span>
          {['password', 'financial', 'mfa', 'sim-swap', 'credit-freeze', 'phishing', 'lockdown'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Playbook Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs text-slate-400 px-1">
          <span>Results: {playbooks.length} playbooks</span>
          {query && <span className="font-mono text-sky-400">Query: "{query}"</span>}
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Searching guidance library...</div>
        ) : playbooks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-xl">
            No guidance playbooks matched your query. Try broader keywords like "password", "email", or "freeze".
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {playbooks.map((pb) => {
              const isExpanded = expandedId === pb._id;
              const totalEstMinutes = pb.steps.reduce((sum, s) => sum + s.estimated_minutes, 0);

              return (
                <div
                  key={pb._id}
                  className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h2 className="text-lg font-bold text-white">{pb.title}</h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-amber-400 border border-slate-700">
                          Priority {pb.priority}
                        </span>
                        {pb.score !== undefined && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-400 border border-sky-800">
                            Relevance: {pb.score.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed">{pb.summary}</p>

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="text-[11px] text-slate-500">Applies to:</span>
                        {pb.applies_to.data_types.map((dt) => (
                          <span
                            key={dt}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950 text-slate-300 border border-slate-800 capitalize"
                          >
                            {dt.replace('_', ' ')}
                          </span>
                        ))}
                        <span className="text-slate-600 text-xs">&bull;</span>
                        <span className="text-[11px] text-slate-400">~{totalEstMinutes} min total</span>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : pb._id)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold text-xs border border-slate-700 transition"
                      >
                        {isExpanded ? 'Hide Steps' : `View ${pb.steps.length} Steps &rarr;`}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Step-by-Step Instructions */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Actionable Instructions:
                      </h4>
                      <div className="space-y-2.5">
                        {pb.steps.map((st) => (
                          <div
                            key={st.order}
                            className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start space-x-3 text-sm text-slate-200"
                          >
                            <span className="font-mono text-sky-400 font-bold">{st.order}.</span>
                            <span className="flex-1">{st.text}</span>
                            <span className="text-xs text-slate-500 whitespace-nowrap">
                              ~{st.estimated_minutes} min
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
