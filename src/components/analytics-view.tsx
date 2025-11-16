'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Overview {
  total: number;
  submitted: number;
  won: number;
  watching?: number;
  building?: number;
  shortlisted?: number;
}

interface TimelineData {
  month: string;
  participated: number;
  won: number;
}

export function AnalyticsView() {
  const [overview, setOverview] = useState<Overview>({ total: 0, submitted: 0, won: 0 });
  const [themes, setThemes] = useState<Record<string, { participated: number; won: number }>>({});
  const [timeline, setTimeline] = useState<TimelineData[]>([]);

  useEffect(() => {
    fetch('/api/analytics/overview').then((res) => res.json()).then(setOverview);
    fetch('/api/analytics/themes').then((res) => res.json()).then(setThemes);
    fetch('/api/analytics/timeline').then((res) => res.json()).then((data) => setTimeline(data || [])).catch(() => setTimeline([]));
  }, []);

  const cards = [
    { label: 'Total Hackathons', value: overview.total, color: 'text-blue-400' },
    { label: 'Submitted', value: overview.submitted, color: 'text-emerald-400' },
    { label: 'Won', value: overview.won, color: 'text-yellow-400' },
    { label: 'Win Rate', value: overview.submitted > 0 ? `${((overview.won / overview.submitted) * 100).toFixed(1)}%` : '0%', color: 'text-purple-400' },
  ];

  // Prepare data for charts
  const themeChartData = Object.entries(themes).map(([theme, stats]) => ({
    theme,
    participated: stats.participated,
    won: stats.won,
    winRate: stats.participated > 0 ? ((stats.won / stats.participated) * 100).toFixed(1) : 0,
  }));

  const statusDistribution = [
    { name: 'Watching', value: overview.watching || 0, color: '#64748b' },
    { name: 'Building', value: overview.building || 0, color: '#3b82f6' },
    { name: 'Submitted', value: overview.submitted || 0, color: '#10b981' },
    { name: 'Won', value: overview.won || 0, color: '#f59e0b' },
    { name: 'Shortlisted', value: overview.shortlisted || 0, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-white">Analytics Dashboard</h2>
        <p className="text-sm text-slate-400">Comprehensive insights into your hackathon journey</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution Pie Chart */}
        {statusDistribution.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Theme Performance Bar Chart */}
        {themeChartData.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance by Theme</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={themeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="theme" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="participated" fill="#3b82f6" name="Participated" />
                <Bar dataKey="won" fill="#10b981" name="Won" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Timeline Chart */}
      {timeline.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Participation Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="participated" stroke="#3b82f6" strokeWidth={2} name="Participated" />
              <Line type="monotone" dataKey="won" stroke="#10b981" strokeWidth={2} name="Won" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Theme Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">Detailed Theme Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-3">Theme</th>
                <th className="px-6 py-3">Participated</th>
                <th className="px-6 py-3">Won</th>
                <th className="px-6 py-3">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {themeChartData.map((theme) => (
                <tr key={theme.theme} className="border-t border-slate-800 text-slate-200 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{theme.theme}</td>
                  <td className="px-6 py-4">{theme.participated}</td>
                  <td className="px-6 py-4 text-emerald-400">{theme.won}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${Number(theme.winRate) > 50 ? 'text-emerald-400' : Number(theme.winRate) > 25 ? 'text-yellow-400' : 'text-slate-400'}`}>
                      {theme.winRate}%
                    </span>
                  </td>
                </tr>
              ))}
              {themeChartData.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-slate-400" colSpan={4}>
                    No theme data available yet. Start participating in hackathons to see your performance!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
