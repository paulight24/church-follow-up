import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

/**
 * Shared chrome for the privacy policy and terms pages. They are read rarely
 * but by people who matter — a carrier reviewer verifying an SMS programme, a
 * pastor deciding whether to trust the platform with their congregation's
 * details — so they get the same header and footer as the rest of the public
 * site rather than looking like an afterthought.
 */
interface LegalPageShellProps {
  title: string;
  lastUpdated: string;
  intro: string;
  children: ReactNode;
}

export function LegalPageShell({ title, lastUpdated, intro, children }: LegalPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/welcome" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Member Care</span>
          </Link>
          <Link
            to="/welcome"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated {lastUpdated}</p>
        <p className="mt-6 text-lg leading-relaxed text-slate-600">{intro}</p>

        <div
          className="mt-10 space-y-10 text-slate-600
            [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900
            [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-800
            [&_p]:mt-3 [&_p]:leading-relaxed
            [&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:list-disc [&_li]:leading-relaxed
            [&_a]:font-medium [&_a]:text-indigo-600 [&_a:hover]:text-indigo-700
            [&_strong]:font-semibold [&_strong]:text-slate-800"
        >
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <span>&copy; {new Date().getFullYear()} Member Care</span>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-slate-900">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-900">Terms</Link>
            <Link to="/contacts" className="hover:text-slate-900">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
