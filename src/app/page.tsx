import { hackathonPipeline, getPipelineSummary } from '@/lib/hackathons';
import { isFoundationReady, roadmap } from '@/lib/roadmap';

const phaseOne = roadmap.find((phase) => phase.id === 'phase-1');
const foundationReady = isFoundationReady();
const pipelineSummary = getPipelineSummary();

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(date));

export default function HomePage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-lg text-slate-100">
          Welcome to Hackathon Copilot. This workspace guides the end-to-end lifecycle for scouting,
          planning, and executing competitive builds.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {foundationReady
            ? 'Phase 0 foundation is locked. Phase 1 insights are now available to help prioritize the opportunity funnel.'
            : 'Phase 0 infrastructure is still in progress. Complete it to unlock the Phase 1 planning surface.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-sm uppercase tracking-wide text-slate-400">Pipeline</p>
          <p className="mt-2 text-3xl font-semibold text-white">{hackathonPipeline.length}</p>
          <p className="text-xs text-slate-500">Hackathons in the 90-day window</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-sm uppercase tracking-wide text-slate-400">Avg confidence</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {(pipelineSummary.avgConfidence * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-slate-500">Weighted by ops scoring rubric</p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-sm uppercase tracking-wide text-slate-400">Committed pods</p>
          <p className="mt-2 text-3xl font-semibold text-white">{pipelineSummary.committed}</p>
          <p className="text-xs text-slate-500">Pods with travel + budget approved</p>
        </div>
      </div>

      {foundationReady && (
        <div className="space-y-8">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Phase 1</p>
                <h2 className="text-2xl font-bold text-white">Opportunity Radar</h2>
                <p className="text-sm text-slate-400">{phaseOne?.summary}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Status</p>
                <p className="text-lg font-semibold text-amber-300">{phaseOne?.status ?? 'blocked'}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {phaseOne?.checklist.map((item) => (
                <div key={item.title} className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">{item.owner}</p>
                  <p className="mt-1 text-base font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-slate-400">{item.detail}</p>
                  <span
                    className={`mt-3 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      item.status === 'done'
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.status === 'done' ? 'Complete' : 'Planned'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Hackathon pipeline</h3>
                <p className="text-sm text-slate-400">Sorted by decision stage</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-400">
                      <th className="px-3 py-2 font-medium">Event</th>
                      <th className="px-3 py-2 font-medium">Timing</th>
                      <th className="px-3 py-2 font-medium">Focus</th>
                      <th className="px-3 py-2 font-medium">Stage</th>
                      <th className="px-3 py-2 font-medium">Confidence</th>
                      <th className="px-3 py-2 font-medium">Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hackathonPipeline.map((hack) => (
                      <tr key={hack.id} className="border-t border-slate-800 text-slate-200">
                        <td className="px-3 py-3">
                          <p className="font-semibold text-white">{hack.name}</p>
                          <p className="text-xs text-slate-400">
                            {hack.region} • {hack.format}
                          </p>
                          <p className="text-xs text-slate-500">{hack.notes}</p>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-300">
                          {formatDate(hack.startDate)} – {formatDate(hack.endDate)}
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-300">
                          {hack.focusAreas.join(', ')}
                        </td>
                        <td className="px-3 py-3 text-sm">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              hack.stage === 'committed'
                                ? 'bg-emerald-500/10 text-emerald-300'
                                : hack.stage === 'shortlisted'
                                ? 'bg-amber-500/10 text-amber-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {hack.stage}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-300">
                          {(hack.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-300">{hack.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-xl font-semibold text-white">Team readiness</h3>
              <p className="mt-2 text-sm text-slate-400">
                Pods and leads that are cleared for Phase 1 execution once sponsor kits finalize.
              </p>
              <div className="mt-4 space-y-4">
                {[
                  {
                    label: 'Product pods cleared',
                    value: `${pipelineSummary.committed} / ${hackathonPipeline.length}`,
                    detail: 'Able to travel or deploy remotely',
                  },
                  {
                    label: 'Shortlist follow-ups this week',
                    value: pipelineSummary.shortlisted,
                    detail: 'Need sponsor approval + compliance forms',
                  },
                  {
                    label: 'Watchlist opportunities',
                    value: pipelineSummary.watching,
                    detail: 'Awaiting announcements',
                  },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">{metric.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{metric.value}</p>
                    <p className="text-sm text-slate-500">{metric.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
