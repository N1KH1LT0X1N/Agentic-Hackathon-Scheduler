'use client';

import { useEffect, useState } from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';

interface HackathonDiscovery {
  id: string;
  title: string;
  url: string;
  platform: { name: string };
  startDate?: string;
  endDate?: string;
  prizePool?: number | null;
  currency?: string | null;
  priorityScore: number;
  locationType: string;
}

export function DiscoverView() {
  const [data, setData] = useState<HackathonDiscovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/hackathons/discovery')
      .then((res) => res.json())
      .then((json) => setData(json))
      .finally(() => setLoading(false));
  }, []);

  const addToPipeline = async (hackathonId: string) => {
    setMessage(null);
    const response = await fetch(`/api/team-hackathons/${hackathonId}`, { method: 'POST' });
    if (response.ok) {
      setMessage('Hackathon added to pipeline');
    } else {
      const json = await response.json();
      setMessage(json.error ?? 'Unable to add hackathon');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Discovery feed</h2>
        <p className="text-sm text-slate-400">
          Ranked opportunities based on your team preferences and skills.
        </p>
      </div>
      {message && <p className="text-sm text-emerald-300">{message}</p>}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Hackathon</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Timing</th>
              <th className="px-4 py-3">Prize</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Action</th>
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
            {!loading && data.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-slate-400" colSpan={6}>
                  No upcoming hackathons detected yet.
                </td>
              </tr>
            )}
            {data.map((hackathon) => (
              <tr key={hackathon.id} className="border-t border-slate-800 text-slate-200">
                <td className="px-4 py-4">
                  <div>
                    <p className="font-semibold text-white">{hackathon.title}</p>
                    <p className="text-xs text-slate-400">{hackathon.locationType}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-400">{hackathon.platform?.name}</td>
                <td className="px-4 py-4 text-slate-300">
                  {formatDate(hackathon.startDate ?? null)} → {formatDate(hackathon.endDate ?? null)}
                </td>
                <td className="px-4 py-4 text-slate-300">
                  {formatCurrency(hackathon.prizePool ?? null, hackathon.currency ?? 'USD')}
                </td>
                <td className="px-4 py-4 text-emerald-300 font-semibold">{hackathon.priorityScore.toFixed(2)}</td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => addToPipeline(hackathon.id)}
                    className="rounded-lg border border-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-300"
                  >
                    Add to pipeline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
