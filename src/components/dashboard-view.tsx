'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  team: {
    name: string;
  };
}

interface DashboardProps {
  user: User;
}

interface QuickStats {
  total: number;
  watching: number;
  building: number;
  submitted: number;
  won: number;
}

interface Alert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  teamHackathonId: string;
}

interface UpcomingHackathon {
  id: string;
  title: string;
  platform: { name: string };
  startDate: string | null;
  endDate: string | null;
  priorityScore: number;
  status: string;
}

export function DashboardView({ user }: DashboardProps) {
  const [stats, setStats] = useState<QuickStats>({ total: 0, watching: 0, building: 0, submitted: 0, won: 0 });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingHackathon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics/overview').then((res) => res.json()),
      fetch('/api/alerts').then((res) => res.json()),
      fetch('/api/team-hackathons?limit=5').then((res) => res.json()),
    ])
      .then(([statsData, alertsData, hackathonsData]) => {
        setStats(statsData);
        setAlerts(Array.isArray(alertsData) ? alertsData : []);
        setUpcoming(Array.isArray(hackathonsData) ? hackathonsData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const quickActions = [
    { label: 'Discover Hackathons', href: '/discover', icon: '🔍', color: 'emerald' },
    { label: 'View Pipeline', href: '/command-center', icon: '📊', color: 'blue' },
    { label: 'Analytics', href: '/analytics', icon: '📈', color: 'purple' },
    { label: 'Settings', href: '/settings/preferences', icon: '⚙️', color: 'slate' },
  ];

  const statCards = [
    { label: 'Total Hackathons', value: stats.total, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Building', value: stats.building, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Submitted', value: stats.submitted, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Won', value: stats.won, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-emerald-900/20 to-blue-900/10 p-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="mt-2 text-lg text-slate-300">
          Team: <span className="font-semibold text-emerald-400">{user.team.name}</span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-xl border border-slate-800 ${card.bg} backdrop-blur p-6`}>
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className={`mt-2 text-4xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              🔔 Active Alerts
              <span className="text-sm font-normal text-slate-400">({alerts.length})</span>
            </h2>
            <Link href="/command-center" className="text-sm text-emerald-400 hover:text-emerald-300">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={`px-6 py-4 ${
                  alert.severity === 'critical'
                    ? 'bg-red-500/5 border-l-4 border-red-500'
                    : alert.severity === 'warning'
                    ? 'bg-yellow-500/5 border-l-4 border-yellow-500'
                    : 'bg-blue-500/5 border-l-4 border-blue-500'
                }`}
              >
                <p className="text-sm text-slate-200">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-emerald-400 hover:bg-slate-800/50 transition-all"
              >
                <div className="text-3xl mb-2">{action.icon}</div>
                <p className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">
                  {action.label}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Hackathons */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Your Pipeline</h2>
            <Link href="/command-center" className="text-sm text-emerald-400 hover:text-emerald-300">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {upcoming.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-400">
                <p className="text-sm">No hackathons in your pipeline yet</p>
                <Link href="/discover" className="mt-2 inline-block text-emerald-400 hover:text-emerald-300 text-sm">
                  Discover hackathons →
                </Link>
              </div>
            ) : (
              upcoming.slice(0, 5).map((hack) => (
                <Link
                  key={hack.id}
                  href={`/hackathons/${hack.id}`}
                  className="block px-6 py-4 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{hack.title}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {hack.platform.name} • {formatDate(hack.startDate)}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400">
                        {hack.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Performance Snapshot</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-xl bg-slate-800/50">
            <p className="text-3xl font-bold text-blue-400">{stats.watching}</p>
            <p className="text-sm text-slate-400 mt-1">Watching</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-slate-800/50">
            <p className="text-3xl font-bold text-emerald-400">{stats.building}</p>
            <p className="text-sm text-slate-400 mt-1">In Progress</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-slate-800/50">
            <p className="text-3xl font-bold text-purple-400">
              {stats.submitted > 0 ? ((stats.won / stats.submitted) * 100).toFixed(0) : 0}%
            </p>
            <p className="text-sm text-slate-400 mt-1">Win Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
