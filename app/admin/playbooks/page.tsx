'use client';

import { useState, useEffect } from 'react';

interface PlaybookStep {
  order: number;
  text: string;
  estimated_minutes: number;
}

interface AdminPlaybook {
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
}

export default function AdminPlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<AdminPlaybook[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [dataTypesInput, setDataTypesInput] = useState('password');
  const [minRank, setMinRank] = useState(2);
  const [priority, setPriority] = useState(4);
  const [tagsInput, setTagsInput] = useState('credentials, security');
  const [steps, setSteps] = useState<PlaybookStep[]>([
    { order: 1, text: '', estimated_minutes: 5 },
  ]);
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const loadPlaybooks = async () => {
    try {
      const res = await fetch('/api/admin/playbooks');
      if (res.ok) {
        const data = await res.json();
        setPlaybooks(data.playbooks || []);
      }
    } catch (err) {
      console.error('Failed to load playbooks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaybooks();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSummary('');
    setDataTypesInput('password');
    setMinRank(2);
    setPriority(4);
    setTagsInput('credentials, security');
    setSteps([{ order: 1, text: '', estimated_minutes: 5 }]);
    setMessage(null);
  };

  const handleEditClick = (pb: AdminPlaybook) => {
    setEditingId(pb._id);
    setTitle(pb.title);
    setSummary(pb.summary);
    setDataTypesInput(pb.applies_to.data_types.join(', '));
    setMinRank(pb.applies_to.min_severity_rank);
    setPriority(pb.priority);
    setTagsInput(pb.tags.join(', '));
    setSteps(pb.steps.length > 0 ? pb.steps : [{ order: 1, text: '', estimated_minutes: 5 }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guidance playbook?')) return;

    try {
      const res = await fetch(`/api/admin/playbooks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadPlaybooks();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete playbook');
      }
    } catch (err) {
      alert('Network error while deleting playbook');
    }
  };

  const handleAddStep = () => {
    setSteps([...steps, { order: steps.length + 1, text: '', estimated_minutes: 5 }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    const nextSteps = steps.filter((_, idx) => idx !== index).map((s, idx) => ({ ...s, order: idx + 1 }));
    setSteps(nextSteps);
  };

  const handleStepChange = (index: number, field: 'text' | 'estimated_minutes', value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const payload = {
      title,
      summary,
      applies_to: {
        data_types: dataTypesInput.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
        min_severity_rank: Number(minRank),
      },
      priority: Number(priority),
      steps: steps.filter((s) => s.text.trim().length > 0),
      tags: tagsInput.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
    };

    if (payload.steps.length === 0) {
      setMessage({ text: 'Playbook must contain at least one step.', isError: true });
      return;
    }

    try {
      const url = editingId ? `/api/admin/playbooks/${editingId}` : '/api/admin/playbooks';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.error || 'Failed to save playbook', isError: true });
      } else {
        setMessage({
          text: editingId ? 'Playbook updated successfully.' : 'Playbook created successfully.',
          isError: false,
        });
        resetForm();
        loadPlaybooks();
      }
    } catch (err) {
      setMessage({ text: 'A network error occurred.', isError: true });
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white">Remediation Playbooks Management</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage MongoDB <code className="text-sky-400 font-mono text-xs">guidance_playbooks</code> collection governed by strict $jsonSchema validators and weighted text indexes.
        </p>
      </div>

      {/* Playbook Editor Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              {editingId ? 'Edit Guidance Playbook' : 'Author New Guidance Playbook'}
            </h2>
            <p className="text-xs text-slate-400">Validated against MongoDB $jsonSchema</p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded bg-slate-800"
            >
              Cancel Edit
            </button>
          )}
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Playbook Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Key Rotation & Password Vault Update"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Priority Tier (1 Low to 5 Urgent)
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value={5}>Priority 5 (Highest / Critical triage)</option>
                <option value={4}>Priority 4 (High risk mitigation)</option>
                <option value={3}>Priority 3 (Medium risk hygiene)</option>
                <option value={2}>Priority 2 (Preventive countermeasure)</option>
                <option value={1}>Priority 1 (Informational advice)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Summary Description
            </label>
            <textarea
              rows={2}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Concise overview explaining why and when this playbook applies..."
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Applies To Data Types (comma-separated)
              </label>
              <input
                type="text"
                required
                value={dataTypesInput}
                onChange={(e) => setDataTypesInput(e.target.value)}
                placeholder="password, financial, email"
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Min Severity Rank (1-4)
              </label>
              <select
                value={minRank}
                onChange={(e) => setMinRank(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value={1}>Rank 1 (Low+)</option>
                <option value={2}>Rank 2 (Medium+)</option>
                <option value={3}>Rank 3 (High+)</option>
                <option value={4}>Rank 4 (Critical only)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Search Tags (comma-separated, indexed for text search)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="passwords, credentials, rotation, critical"
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Dynamic Steps List */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Action Steps ({steps.length})
              </label>
              <button
                type="button"
                onClick={handleAddStep}
                className="text-xs text-sky-400 hover:text-white font-medium"
              >
                + Add Another Step
              </button>
            </div>

            <div className="space-y-2">
              {steps.map((st, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="font-mono text-xs text-slate-400 w-6 text-center">{idx + 1}.</span>
                  <input
                    type="text"
                    required
                    value={st.text}
                    onChange={(e) => handleStepChange(idx, 'text', e.target.value)}
                    placeholder="Specific actionable instruction..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={st.estimated_minutes}
                    onChange={(e) => handleStepChange(idx, 'estimated_minutes', Number(e.target.value))}
                    className="w-20 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs text-center focus:outline-none focus:ring-2 focus:ring-sky-500"
                    title="Estimated minutes"
                  />
                  <span className="text-[10px] text-slate-500">min</span>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="text-xs text-slate-500 hover:text-rose-400 px-1.5"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition"
            >
              {editingId ? 'Update Playbook' : 'Create Guidance Playbook'}
            </button>
          </div>
        </form>
      </div>

      {/* Playbooks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Guidance Playbooks Repository</h2>
          <span className="text-xs text-slate-400 font-mono">Total: {playbooks.length}</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading playbooks...</div>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {playbooks.map((pb) => (
              <div key={pb._id} className="p-6 hover:bg-slate-800/20 transition flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{pb.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-amber-400 border border-slate-700">
                      Priority {pb.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{pb.summary}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-400">
                    <span>Types: <strong className="text-slate-300">{pb.applies_to.data_types.join(', ')}</strong></span>
                    <span>&bull;</span>
                    <span>Min Rank: {pb.applies_to.min_severity_rank}</span>
                    <span>&bull;</span>
                    <span>{pb.steps.length} Steps</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:self-center">
                  <button
                    onClick={() => handleEditClick(pb)}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(pb._id)}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 text-xs font-medium border border-slate-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
