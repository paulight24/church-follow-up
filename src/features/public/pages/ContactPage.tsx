import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { ContactSection } from '../components/ContactSection';
import { useSeo } from '@/lib/seo';

/**
 * Public contact page at /contacts — kept off the landing page so the
 * funnel stays a single call to action (register your church) and the
 * contact form has a link people can be sent directly.
 */
export function ContactPage() {
  useSeo({
    title: 'Contact Us — Church Member Care',
    description:
      'Questions about Member Care for your church? Talk to us about follow-up, member care and live sermon translation.',
    path: '/contacts',
  });

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

      <main className="flex-1">
        <ContactSection />
      </main>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <span className="text-sm font-semibold text-slate-700">Member Care</span>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Member Care. Built for churches that care.
          </p>
        </div>
      </footer>
    </div>
  );
}
