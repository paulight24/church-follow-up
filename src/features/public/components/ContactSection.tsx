import { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';
import api from '@/config/api';

/**
 * Public contact form on the landing page. The destination inbox lives
 * server-side only (backend config.platform.contactEmail) — deliberately
 * no address is rendered here and none comes back in the response, so the
 * public site gives a scraper nothing to harvest.
 */
export function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [churchName, setChurchName] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — real users never see it
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await api.post('/public/contact', { name, email, churchName: churchName || undefined, message, website });
      setStatus('sent');
      setName('');
      setEmail('');
      setChurchName('');
      setMessage('');
    } catch (err) {
      const apiError = err as { response?: { data?: { error?: { message?: string } } } };
      setError(apiError.response?.data?.error?.message ?? 'Something went wrong. Please try again in a moment.');
      setStatus('error');
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100';

  return (
    <section id="contact" className="bg-slate-50 py-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Mail className="h-3.5 w-3.5" />
            Talk to us
          </span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Questions before you start?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Tell us about your church and what you are trying to solve — whether that is following up
            first-timers, remembering birthdays, or getting your whole team on the same page. We read
            every message and reply personally.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            {[
              'Set-up help for your first cycle',
              'Moving your existing member records across',
              'Using your own SMS, email or WhatsApp accounts',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {status === 'sent' ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">Message sent</h3>
              <p className="mt-2 max-w-xs text-sm text-slate-600">
                Thank you — we have it, and we will get back to you shortly.
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-6 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Your name
                  </label>
                  <input
                    id="contact-name"
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Grace Adeyemi"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@yourchurch.org"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-church" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Church <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  id="contact-church"
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  className={inputClass}
                  placeholder="Christ Embassy Los Angeles"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-slate-700">
                  How can we help?
                </label>
                <textarea
                  id="contact-message"
                  required
                  minLength={10}
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={inputClass}
                  placeholder="Tell us a little about your church and what you need…"
                />
              </div>

              {/* Honeypot: hidden from people, irresistible to bots. */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="hidden"
              />

              {status === 'error' && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>
              <p className="text-center text-xs text-slate-400">
                We only use your details to reply to this message.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
