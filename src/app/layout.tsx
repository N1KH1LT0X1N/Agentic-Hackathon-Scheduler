import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hackathon Copilot',
  description: 'AI-powered hackathon command center',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-100`}>
        <div className="min-h-screen">
          <header className="border-b border-slate-800 bg-slate-900/60 px-6 py-4">
            <h1 className="text-2xl font-semibold">Hackathon Copilot</h1>
            <p className="text-sm text-slate-400">
              AI-powered command center for multi-tenant hackathon teams.
            </p>
          </header>
          <main className="px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
