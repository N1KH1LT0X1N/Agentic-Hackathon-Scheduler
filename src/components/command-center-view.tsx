'use client';

import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';

interface TeamHackathonRow {
  id: string;
  status: string;
  priorityScore: number;
  hackathon: {
    title: string;
    startDate?: string;
    endDate?: string;
    platform: { name: string };
  };
}

interface AlertItem {
  teamHackathonId: string;
  severity: string;
  message: string;
}

const statuses = ['WATCHING', 'REGISTERED', 'BUILDING', 'SUBMITTED', 'SKIPPED'];

export function CommandCenterView() {
  const [rows, setRows] = useState<TeamHackathonRow[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [hacks, alertRes] = await Promise.all([
      fetch('/api/team-hackathons').then((res) => res.json()),
      fetch('/api/alerts').then((res) => res.json()),
    ]);
    setRows(hacks);
    setAlerts(alertRes);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/team-hackathons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setToast('Status updated');
    loadData();
  };

  const generatePlan = async (id: string) => {
    await fetch(`/api/team-hackathons/${id}/generate-plan`, { method: 'POST' });
    setToast('Plan generated and tasks refreshed');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-white">Command center</h2>
        <p className="text-sm text-slate-400">Monitor every active hackathon tied to your team.</p>
      </div>
      {toast && <p className="text-sm text-emerald-300">{toast}</p>}
      {alerts.length > 0 && (
        <div className="space-y-2 rounded-xl border border-amber-400/40 bg-amber-500/10 p-4 text-amber-200">
          <p className="text-sm font-semibold">Alerts</p>
          <ul className="space-y-1 text-sm">
            {alerts.map((alert) => (
              <li key={`${alert.teamHackathonId}-${alert.message}`}>• {alert.message}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Hackathon</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={6}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-slate-400" colSpan={6}>
                  No team hackathons yet. Use the discovery feed to add one.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-800 text-slate-200">
                <td className="px-4 py-4">
                  <p className="font-semibold text-white">{row.hackathon.title}</p>
                </td>
                <td className="px-4 py-4 text-slate-400">{row.hackathon.platform?.name}</td>
                <td className="px-4 py-4 text-slate-300">
                  {formatDate(row.hackathon.startDate ?? null)} → {formatDate(row.hackathon.endDate ?? null)}
                </td>
                <td className="px-4 py-4 text-emerald-300 font-semibold">{row.priorityScore.toFixed(2)}</td>
                <td className="px-4 py-4">
                  <select
                    className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1 text-xs"
                    value={row.status}
                    onChange={(event) => updateStatus(row.id, event.target.value)}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-4 space-x-2">
                  <button
                    onClick={() => generatePlan(row.id)}
                    className="rounded-lg border border-emerald-500 px-3 py-1 text-xs text-emerald-300"
                  >
                    Generate plan
                  </button>
                  <a
                    href={`/hackathons/${row.id}`}
                    className="rounded-lg border border-slate-600 px-3 py-1 text-xs text-slate-200"
                  >
                    Open workspace
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
