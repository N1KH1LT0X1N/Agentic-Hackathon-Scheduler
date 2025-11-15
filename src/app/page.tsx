import Link from 'next/link';

const features = [
  {
    title: 'Discover hackathons',
    description: 'Unified feed across Devpost, Devfolio, and more with priority scoring.',
    href: '/discover',
  },
  {
    title: 'Command center',
    description: 'Track pipeline status, generate plans, and keep tasks aligned.',
    href: '/command-center',
  },
  {
    title: 'Workspace + AI copilot',
    description: 'Review tasks, project collateral, and ask the AI for next steps.',
    href: '/hackathons',
  },
];

export default function HomePage() {
  return (
    <section className="space-y-10">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
        <p className="text-xs uppercase tracking-widest text-emerald-300">Hackathon Copilot</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Multi-tenant hackathon ops in one pane</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          Discover events, align team preferences, auto-generate schedules, and keep submissions on track with
          built-in AI support.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link href="/signup" className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-950">
            Create a team
          </Link>
          <Link href="/discover" className="rounded-full border border-slate-700 px-5 py-2 text-sm text-white">
            View discovery feed
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Link
            key={feature.title}
            href={feature.href}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-emerald-400"
          >
            <p className="text-base font-semibold text-white">{feature.title}</p>
            <p className="mt-2 text-sm text-slate-400">{feature.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
