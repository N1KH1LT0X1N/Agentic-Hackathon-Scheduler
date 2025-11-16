import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { DashboardView } from '@/components/dashboard-view';

const features = [
  {
    title: '🔍 Smart Discovery',
    description: 'AI-powered hackathon discovery with intelligent priority scoring across multiple platforms.',
    href: '/discover',
    icon: '🎯',
  },
  {
    title: '📊 Command Center',
    description: 'Centralized pipeline management with status tracking and automated task generation.',
    href: '/command-center',
    icon: '⚡',
  },
  {
    title: '🤖 AI Workspace',
    description: 'Interactive workspace with AI copilot, task management, and submission checklists.',
    href: '/hackathons',
    icon: '🚀',
  },
  {
    title: '📈 Analytics',
    description: 'Comprehensive insights with visual charts, win rates, and performance tracking.',
    href: '/analytics',
    icon: '💡',
  },
  {
    title: '⚙️ Preferences',
    description: 'Customize your team\'s hackathon preferences, themes, and participation criteria.',
    href: '/settings/preferences',
    icon: '🎨',
  },
  {
    title: '✅ Alerts',
    description: 'Real-time notifications for deadlines, overdue tasks, and submission requirements.',
    href: '/command-center',
    icon: '🔔',
  },
];

const stats = [
  { label: 'Active Platforms', value: '8+', description: 'Devpost, Devfolio, Unstop, and more' },
  { label: 'Smart Scoring', value: 'AI', description: 'Intelligent priority algorithm' },
  { label: 'Task Automation', value: '100%', description: 'Auto-generated hackathon plans' },
  { label: 'Multi-tenant', value: '🏢', description: 'Team-based collaboration' },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    return <DashboardView user={user} />;
  }

  return (
    <section className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-emerald-900/20 p-10 lg:p-14">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10">
          <div className="inline-block rounded-full bg-emerald-500/10 px-4 py-1.5 mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              AI-Powered Hackathon Management
            </p>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
            Your Complete
            <span className="block mt-2 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Hackathon Command Center
            </span>
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-slate-300 leading-relaxed">
            Discover opportunities, manage your pipeline, automate tasks, and maximize your team's hackathon success
            with intelligent AI assistance - all in one powerful platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-emerald-500 px-8 py-3.5 text-base font-semibold text-emerald-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25"
            >
              Get Started Free
            </Link>
            <Link
              href="/discover"
              className="rounded-full border-2 border-slate-700 px-8 py-3.5 text-base font-semibold text-white hover:border-emerald-400 hover:bg-slate-800/50 transition-all"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center backdrop-blur">
            <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
            <p className="text-sm font-semibold text-slate-300">{stat.label}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Everything You Need to Win</h2>
          <p className="text-lg text-slate-400">Powerful features designed for hackathon excellence</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-7 transition-all hover:border-emerald-400 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-emerald-500/10"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <p className="text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors">
                {feature.title}
              </p>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              <div className="mt-4 inline-flex items-center text-sm font-medium text-emerald-400 group-hover:text-emerald-300">
                Learn more →
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 p-10 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Level Up Your Hackathon Game?</h2>
        <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
          Join teams already using Hackathon Copilot to discover, manage, and win more hackathons.
        </p>
        <Link
          href="/signup"
          className="inline-block rounded-full bg-emerald-500 px-10 py-4 text-lg font-semibold text-emerald-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25"
        >
          Create Your Team Now
        </Link>
      </div>
    </section>
  );
}
