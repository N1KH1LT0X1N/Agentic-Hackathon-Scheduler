export default function HomePage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-lg text-slate-300">
          Welcome to Hackathon Copilot. This workspace will help you discover hackathons,
          plan them, and coordinate your team end-to-end.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Project setup complete. Continue through the implementation phases to unlock more features.
        </p>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-xl font-semibold">Status</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-300">
          <li>Next.js App Router + Tailwind ready.</li>
          <li>Prisma and PostgreSQL wiring prepared.</li>
          <li>Health-check API route available at <code className="text-blue-400">/api/health</code>.</li>
        </ul>
      </div>
    </section>
  );
}
