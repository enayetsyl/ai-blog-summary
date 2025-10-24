import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Nightly AI Blog Summarizer',
  description: 'Summaries of daily AI blog updates across leading sources'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <Providers>
          <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-10 border-b border-slate-800 pb-6">
              <h1 className="text-3xl font-semibold tracking-tight">Nightly AI Blog Summarizer</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Browse concise Gemini-powered digests of the latest AI posts from 20 leading engineering and research teams.
              </p>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="mt-12 text-xs text-slate-500">
              Summaries update automatically every midnight Asia/Dhaka.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
