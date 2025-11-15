'use client';

import { useEffect, useState } from 'react';

interface Overview {
  total: number;
  submitted: number;
  won: number;
}

export function AnalyticsView() {
  const [overview, setOverview] = useState<Overview>({ total: 0, submitted: 0, won: 0 });
  const [themes, setThemes] = useState<Record<string, { participated: number; won: number }>>({});

  useEffect(() => {
    fetch('/api/analytics/overview').then((res) => res.json()).then(setOverview);
    fetch('/api/analytics/themes').then((res) => res.json()).then(setThemes);
  }, []);

  const cards = [
    { label: 'Total hackathons', value: overview.total },
    { label: 'Submitted', value: overview.submitted },
    { label: 'Won', value: overview.won },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-white">Analytics</h2>
        <p className="text-sm text-slate-400">High-level pulse across the pipeline.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Theme</th>
              <th className="px-4 py-3">Participated</th>
              <th className="px-4 py-3">Won</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(themes).map(([theme, stats]) => (
              <tr key={theme} className="border-t border-slate-800 text-slate-200">
                <td className="px-4 py-3">{theme}</td>
                <td className="px-4 py-3">{stats.participated}</td>
                <td className="px-4 py-3">{stats.won}</td>
              </tr>
            ))}
            {Object.keys(themes).length === 0 && (
              <tr>
                <td className="px-4 py-5 text-slate-400" colSpan={3}>
                  No data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
