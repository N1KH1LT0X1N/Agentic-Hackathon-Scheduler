import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import './globals.css';
import { getCurrentUser } from '@/lib/auth';
import { LogoutButton } from '@/components/logout-button';
import { ClientErrorBoundary } from '@/components/client-error-boundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hackathon Copilot',
  description: 'AI-powered hackathon command center',
};

const navLinks = [
  { href: '/discover', label: 'Discover' },
  { href: '/command-center', label: 'Command Center' },
  { href: '/settings/preferences', label: 'Preferences' },
  { href: '/analytics', label: 'Analytics' },
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-100`}>
        <div className="min-h-screen">
          <header className="border-b border-slate-800 bg-slate-900/70">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href="/" className="text-2xl font-semibold text-white">
                  Hackathon Copilot
                </Link>
                <p className="text-sm text-slate-400">
                  AI-powered hub for tracking hackathons, plans, and submissions.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-sm text-slate-300 sm:items-end">
                {user ? (
                  <>
                    <nav className="flex flex-wrap items-center gap-3 text-slate-300">
                      {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="hover:text-white">
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400">{user.name}</span>
                      <LogoutButton />
                    </div>
                  </>
                ) : (
                  <div className="flex gap-4 text-sm">
                    <Link href="/login" className="hover:text-white">
                      Log in
                    </Link>
                    <Link href="/signup" className="text-white">
                      Create account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-8">
            <ClientErrorBoundary>{children}</ClientErrorBoundary>
          </main>
        </div>
      </body>
    </html>
  );
}
