import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  GraduationCap,
  HandHeart,
  Heart,
  LayoutDashboard,
  Megaphone,
  Phone,
  Settings,
  Shield,
  UserCog,
  Users,
  UsersRound,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface GuideFeature {
  icon: LucideIcon;
  title: string;
  path: string;
  description: string;
  steps: string[];
  tip?: string;
}

interface GuideGroup {
  header?: string;
  features: GuideFeature[];
}

const quickStart = [
  { label: 'Check Dashboard', detail: "for what needs attention today" },
  { label: 'Open My Follow-Ups', detail: 'pick the next member in queue' },
  { label: "Review their profile", detail: 'attendance, notes, prior contact' },
  { label: 'Call, using a Call Guide', detail: 'for the right talking points' },
  { label: 'Log the outcome', detail: 'reached, no answer, or needs care' },
  { label: 'Escalate if needed', detail: 'hand serious needs to a pastor' },
];

const guideGroups: GuideGroup[] = [
  {
    features: [
      {
        icon: LayoutDashboard,
        title: 'Dashboard',
        path: '/',
        description:
          'Your landing page. Shows how many follow-ups are open, overdue, or due today, plus recent escalations and activity across your team.',
        steps: [
          "Glance at the counters to see if anything's overdue.",
          'Click any stat card to jump straight into that filtered list.',
        ],
      },
      {
        icon: ClipboardCheck,
        title: 'My Follow-Ups',
        path: '/follow-ups',
        description:
          'The actual work queue — every member assigned to you who needs a call, text, or visit. This is where a typical session starts.',
        steps: [
          "Filter by status (open, overdue) or priority if the list is long.",
          "Click a member's name to open their full profile.",
          'After contact, log the outcome directly from the follow-up record — reached, no answer, voicemail, or needs pastoral care.',
          'Add a note so the next person (or you, next week) has context.',
          'Need someone else to handle it? Use Reassign — pick a team to narrow the list, and its leaders appear at the top.',
        ],
        tip: "A cleared queue doesn't mean you're done — new follow-ups get assigned automatically as visitors and members move through their journey stage.",
      },
      {
        icon: Users,
        title: 'Members',
        path: '/members',
        description:
          'The full member and visitor directory. Search by name, email, or phone; filter by gender, department, cell group, visitor journey stage, or first-timer status.',
        steps: [
          'Search or filter to find someone outside your assigned queue.',
          'Open a profile to see contact info, household, attendance history, and past follow-ups across every tab.',
          'Use Edit to correct contact details, journey stage, cell group, or add pastoral notes.',
          'Use Import to bulk-load a spreadsheet of new visitors, or Duplicates to merge accidental repeats.',
        ],
        tip: '"Cell Group" is this church\'s term for what the system used to label "Fellowship Group" — same field, renamed everywhere in the UI.',
      },
      {
        icon: UsersRound,
        title: 'Teams',
        path: '/teams',
        description:
          'Groups of staff or volunteers who share a follow-up workload — e.g. a "New Converts" team or a "First Timer Callers" team. This is also where you name a team\'s leader.',
        steps: [
          "Open a team to see its workers and assigned follow-up load.",
          'Click Assign Member, pick the person, and set their role to Leader to make them the team leader.',
          'Leaders show up first in the "Assign to" list whenever a follow-up is created or reassigned for that team.',
        ],
        tip: 'A team leader also needs a login with the Team Lead role — see Users, Roles & Settings below.',
      },
      {
        icon: CalendarCheck,
        title: 'Services & Attendance',
        path: '/services',
        description:
          'Create a service (e.g. "Sunday Service, Aug 3"), then check members in. Attendance feeds each member\'s history and their "last attended" date automatically.',
        steps: [
          'Click New Service and give it a name, date, and type.',
          'Open the service, then search for members and tap each one to mark them present.',
          'Tap again to undo. Everything saves as you tap — there is no separate save button.',
          "See any one person's full history on their profile under the Attendance tab.",
        ],
        tip: 'Marking someone present also updates their Last Attendance date, which is what drives absentee follow-ups.',
      },
      {
        icon: AlertTriangle,
        title: 'Escalations',
        path: '/escalations',
        description:
          "Anything that needs a pastor or leader's attention rather than a routine follow-up — a crisis, a serious prayer need, or a member who's been unreachable too long.",
        steps: [
          'From any member profile, click Escalate and describe the concern.',
          'Leadership sees it land here immediately and can claim or resolve it.',
        ],
      },
    ],
  },
  {
    header: 'Communications',
    features: [
      {
        icon: Megaphone,
        title: 'Campaigns',
        path: '/campaigns',
        description:
          'Bigger, scheduled outreach pushes to a defined recipient list — e.g. an Easter invite or a foundation-school reminder — rather than a one-off message.',
        steps: [
          'Pick a recipient list — everyone, by criteria, or hand-picked members.',
          'Write the message, choose channels, and schedule or send.',
        ],
      },
      {
        icon: Heart,
        title: 'Encouragements',
        path: '/encouragements',
        description:
          'Quick, personal-feeling messages — a scripture, a short word — sent In-App, by Email, or by SMS. Also where printable encouragement cards live.',
        steps: [
          'Write the message and optionally attach a scripture reference.',
          'Pick delivery channels — In-App and Email always deliver; SMS delivers once Twilio is configured; Push is not yet live.',
          'Choose the audience: All Members, By Criteria (department, cell group, team, first-timers), or Specific Members you search and hand-pick.',
          'Send now or schedule for later.',
          'Need physical cards for ushers to hand out? Go to Print Cards to lay out and print pre-made encouragement card templates.',
        ],
        tip: 'A member only receives SMS/Email if they\'ve given consent for that channel in their message preferences — check there first if a send comes back "skipped".',
      },
      {
        icon: HandHeart,
        title: 'Prayer Requests',
        path: '/prayer-requests',
        description:
          'Requests submitted through the public prayer request form (no login needed) land here for staff to see and follow up on.',
        steps: [
          'Review new requests as they come in.',
          'Mark as prayed for, or convert to a follow-up if it needs a personal call.',
          'Submitters can mark a request Confidential or Pastor Only — those are locked to Pastor-role accounts.',
        ],
        tip: 'On a locked request, everyone else sees only the category and status — the text, the name, and all actions are hidden.',
      },
      {
        icon: GraduationCap,
        title: 'Foundation School',
        path: '/foundation-school',
        description:
          "Tracks new converts through the church's foundation-class curriculum — from enrollment through graduation.",
        steps: [
          'Enroll a member into the current class.',
          'Track attendance week by week.',
          "Mark graduation once they've completed the series.",
        ],
      },
      {
        icon: BarChart3,
        title: 'Reports',
        path: '/reports',
        description:
          'Roll-up views of follow-up performance — response rates, first-timer retention, escalation volume — filterable by department, cell group, or date range.',
        steps: ['Filter to the slice you care about.', 'Export or share the numbers with leadership.'],
      },
    ],
  },
  {
    header: 'Administration',
    features: [
      {
        icon: Phone,
        title: 'Call Guides',
        path: '/call-guides',
        description:
          'Pre-written scripts for common calls — first-timer welcome, missed-service check-in, new-convert follow-up — so callers stay warm and consistent.',
        steps: [
          'Open the guide that matches the reason for the call, right before dialing.',
          'Follow the prompts, but personalize where you can.',
        ],
      },
      {
        icon: Building2,
        title: 'Departments & Cell Groups',
        path: '/admin/departments',
        description:
          'The org structure members belong to: ministry departments (Ushering, Media, etc.) and cell groups — Noble, Prosperous, Impact, New Creation, Delightsome, Arise & Shine, Praise, Zera, and Phronesis Cell.',
        steps: [
          'Add or rename a department or cell group here.',
          'These lists power the filters everywhere else in the app — Members, Encouragements, Reports.',
        ],
      },
      {
        icon: UserCog,
        title: 'Users, Roles & Settings',
        path: '/admin/users',
        description:
          "Staff accounts, permission roles, church-wide settings (like birthday reminders), and the audit log of who changed what.",
        steps: [
          'To give someone a login: Users → Add User → enter their name, email, and a temporary password, then tick a role before saving.',
          'Roles available include Pastor, Administrator, Team Lead, Follow-Up Worker, Communications Manager, Auditor, and Viewer.',
          'Pick Team Lead for cell/team leaders — it lets them view members, run follow-ups, and assign or reassign work.',
          'Only Pastor can open prayer requests marked Confidential or Pastor Only.',
          'Adjust what any role can see or do under Roles, and check Audit Logs to trace who changed what.',
        ],
        tip: 'Share the temporary password with the person directly and ask them to change it — there is no automatic invite email yet.',
      },
    ],
  },
];

function GuideFeatureCard({ feature }: { feature: GuideFeature }) {
  const Icon = feature.icon;
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
          <code className="text-xs text-slate-400">{feature.path}</code>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-600">{feature.description}</p>

      <ol className="mt-3 space-y-1.5">
        {feature.steps.map((step, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-700">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-100 text-[11px] font-semibold text-indigo-700">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      {feature.tip && (
        <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <span className="font-semibold">Tip: </span>
          {feature.tip}
        </div>
      )}
    </Card>
  );
}

export function GuidePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="App Guide"
        subtitle="A feature-by-feature walkthrough — from the daily follow-up loop to admin settings."
      />

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="default">Quick start</Badge>
          <span className="text-sm text-slate-500">The core follow-up loop, start to finish</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickStart.map((step, i) => (
            <div key={step.label} className="flex items-start gap-2.5 rounded-lg border border-slate-200 p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="text-sm">
                <p className="font-medium text-slate-900">{step.label}</p>
                <p className="text-slate-500">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {guideGroups.map((group, i) => (
        <div key={i} className="space-y-4">
          {group.header && (
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {group.header}
            </h2>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            {group.features.map((feature) => (
              <GuideFeatureCard key={feature.path} feature={feature} />
            ))}
          </div>
        </div>
      ))}

      <p className="pb-4 text-center text-xs text-slate-400">
        Member Care — Christ Embassy Los Angeles &middot; Guide for staff walkthroughs
      </p>
    </div>
  );
}
