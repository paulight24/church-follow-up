import { Link } from 'react-router-dom';
import {
  Heart,
  Users,
  Bell,
  Shield,
  Cake,
  MessagesSquare,
  GraduationCap,
  CalendarCheck,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  Church,
  Languages,
  QrCode,
  Headphones,
} from 'lucide-react';
import { useSeo } from '@/lib/seo';

/**
 * Public marketing funnel — the front door for churches discovering the
 * platform. Deliberately shows NO pricing anywhere: the product is free
 * during launch and monetisation decisions are not surfaced in UI.
 *
 * This is the page organic search lands on, so headings carry the terms
 * churches actually search for ("church follow-up software", "live sermon
 * translation") rather than internal product language.
 */
export function LandingPage() {
  useSeo({
    title: 'Church Member Care Software — Follow-Up, Attendance & Live Sermon Translation',
    description:
      'Free church management software for member follow-up, first-timer care, attendance, cell groups, events and live sermon translation into any language. Every member known, every soul followed up.',
    path: '/',
  });

  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Member Care</span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            <a href="#features" className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block">
              Features
            </a>
            <Link to="/contacts" className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block">
              Contact
            </Link>
            <a href="#how-it-works" className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block">
              How it works
            </a>
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Sign in
            </Link>
            <Link
              to="/register-church"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-indigo-100 backdrop-blur">
              <Church className="h-3.5 w-3.5" />
              Built for churches that love their people
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Every member known.
              <br />
              Every soul followed up.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-100">
              Member Care helps your church remember birthdays, follow up first-timers, encourage
              members, and organise care teams — so people are loved, fed, and they stay.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register-church"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
              >
                Register your church
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Sign in to your church
              </Link>
            </div>
            <p className="mt-6 text-sm text-indigo-200">
              Free to get started · No card required · Your data stays yours, always
            </p>
          </div>
        </div>
      </section>

      {/* ── Social proof strip ──────────────────────────────── */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8">
          <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Multi-church ready</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Role-based access</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Encrypted pastoral notes</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> One-click full data export</span>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Care that grows your church
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            People stay where they are loved. Member Care turns good intentions into a system
            your whole team can run.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Cake className="h-6 w-6" />}
            title="Birthday & anniversary reminders"
            description="Automatic greetings by SMS and email on the day. A church that remembers your birthday is a church you stay in."
          />
          <FeatureCard
            icon={<PhoneCall className="h-6 w-6" />}
            title="First-timer follow-up"
            description="Structured follow-up cycles with call guides, task assignments and escalation to pastors — no visitor falls through the cracks."
          />
          <FeatureCard
            icon={<MessagesSquare className="h-6 w-6" />}
            title="Encouragement messaging"
            description="Scripture and encouragement to the right members on the right channel — in-app, email, SMS or WhatsApp."
          />
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Teams & departments"
            description="Fellowship groups, ushering, follow-up teams — organised with clear responsibilities and worker availability."
          />
          <FeatureCard
            icon={<GraduationCap className="h-6 w-6" />}
            title="Foundation School tracking"
            description="Enrolment to graduation: every new convert's journey tracked class by class, cohort by cohort."
          />
          <FeatureCard
            icon={<CalendarCheck className="h-6 w-6" />}
            title="Services, events & attendance"
            description="Recurring services, event registration with QR codes, attendance insights and guest photo capture."
          />
        </div>
      </section>

      {/* ── Live Translation ────────────────────────────────── */}
      <section id="live-translation" className="bg-gradient-to-br from-slate-900 to-indigo-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200">
                <Languages className="h-3.5 w-3.5" />
                Live sermon translation
              </span>
              <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                Everyone hears the message in their own language
              </h2>
              <p className="mt-4 text-lg text-indigo-100">
                Your media team sends the pastor&apos;s microphone into Member Care. Members scan a
                QR code on the screen, choose their language, and hear the message interpreted
                live through their own earphones — with captions if they prefer to read.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex gap-3 text-indigo-50">
                  <QrCode className="mt-0.5 h-5 w-5 flex-none text-indigo-300" />
                  <span>
                    <strong className="font-semibold text-white">No app to install.</strong> Scan,
                    choose a language, listen. It works on any phone.
                  </span>
                </li>
                <li className="flex gap-3 text-indigo-50">
                  <Headphones className="mt-0.5 h-5 w-5 flex-none text-indigo-300" />
                  <span>
                    <strong className="font-semibold text-white">No special hardware.</strong> No
                    receivers to buy, charge or collect at the door — members use their own earbuds.
                  </span>
                </li>
                <li className="flex gap-3 text-indigo-50">
                  <Languages className="mt-0.5 h-5 w-5 flex-none text-indigo-300" />
                  <span>
                    <strong className="font-semibold text-white">Spanish, Chinese, French,
                    Portuguese, Igbo, Yoruba, Hausa</strong> and more — run several at once.
                  </span>
                </li>
              </ul>
              <Link
                to="/register-church"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-indigo-800 shadow-lg transition hover:bg-indigo-50"
              >
                Bring it to your church
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Listener phone mock — shows the member experience at a glance. */}
            <div className="flex justify-center">
              <div className="w-full max-w-xs rounded-3xl border border-white/10 bg-white p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">Sunday Service</span>
                  <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                    LIVE
                  </span>
                </div>
                <p className="mt-4 text-xs font-medium text-slate-500">Choose your language</p>
                <div className="mt-2 space-y-2">
                  {[
                    { native: '中文', english: 'Chinese' },
                    { native: 'Español', english: 'Spanish' },
                    { native: 'Français', english: 'French' },
                  ].map((lang) => (
                    <div
                      key={lang.english}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">{lang.native}</span>
                        <span className="block text-[11px] text-slate-500">{lang.english}</span>
                      </span>
                      <Headphones className="h-4 w-4 text-indigo-500" />
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-center text-[11px] text-slate-400">
                  Use your own earphones — anything works
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section id="how-it-works" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Up and running in a day</h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-3">
            <StepCard
              step="1"
              title="Register your church"
              description="Two minutes: church name, city, and your admin account. We review and approve new churches quickly."
            />
            <StepCard
              step="2"
              title="Bring your members in"
              description="Import from a spreadsheet or add as you go. Departments, statuses and prayer categories come pre-configured."
            />
            <StepCard
              step="3"
              title="Let the caring begin"
              description="Assign follow-up teams, schedule encouragements, and watch engagement grow week after week."
            />
          </div>
        </div>
      </section>

      {/* ── Security ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Shield className="h-3.5 w-3.5" />
              Security & data ownership
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900">
              Your members' trust, protected
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Pastoral information is sensitive. We treat it that way.
            </p>
            <ul className="mt-6 space-y-3">
              <SecurityPoint text="Each church's data is fully isolated — no other church can ever see it" />
              <SecurityPoint text="Pastoral notes and prayer requests are encrypted with per-church keys" />
              <SecurityPoint text="Role-based permissions: workers see only what their role needs" />
              <SecurityPoint text="Export everything your church owns as a ZIP, any time, with one click" />
            </ul>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-10 text-white shadow-xl">
            <Bell className="h-8 w-8 text-indigo-200" />
            <blockquote className="mt-6 text-xl font-medium leading-relaxed">
              “Feed my lambs… Take care of my sheep.”
            </blockquote>
            <p className="mt-3 text-sm text-indigo-200">John 21:15–17</p>
            <p className="mt-8 text-indigo-100">
              Shepherding at scale needs more than memory. Member Care is the tool that makes
              faithful follow-up possible for every single person who walks through your doors.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to love your members better?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
            Register your church today and start caring in minutes.
          </p>
          <Link
            to="/register-church"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
          >
            Register your church
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Member Care</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/contacts" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Contact us
            </Link>
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Member Care. Built for churches that care.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white shadow-md">
        {step}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

function SecurityPoint({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
      <span className="text-slate-700">{text}</span>
    </li>
  );
}
