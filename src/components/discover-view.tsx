'use client';

import { useEffect, useState, FormEvent } from 'react';
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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function DiscoverView() {
  const [data, setData] = useState<HackathonDiscovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 25, total: 0, totalPages: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('');
  const [locationType, setLocationType] = useState('');
  const [minPrize, setMinPrize] = useState('');

  const fetchHackathons = (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (theme) params.set('theme', theme);
    if (locationType) params.set('locationType', locationType);
    if (minPrize) params.set('minPrize', minPrize);
    params.set('page', page.toString());

    fetch(`/api/hackathons/discovery?${params}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json.data || json);
        if (json.pagination) {
          setPagination(json.pagination);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    fetchHackathons(1);
  };

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

      {/* Search and Filters */}
      <form onSubmit={handleSearch} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-xs text-slate-400">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Keywords..."
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Theme</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. AI, Web3"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">Location</label>
            <select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white"
            >
              <option value="">All</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Min Prize</label>
            <input
              type="number"
              value={minPrize}
              onChange={(e) => setMinPrize(e.target.value)}
              placeholder="e.g. 10000"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-600 transition-colors"
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setTheme('');
              setLocationType('');
              setMinPrize('');
              fetchHackathons(1);
            }}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Clear
          </button>
        </div>
      </form>

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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <p>
            Showing {data.length} of {pagination.total} hackathons
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchHackathons(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="rounded-lg border border-slate-700 px-3 py-1 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchHackathons(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="rounded-lg border border-slate-700 px-3 py-1 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
