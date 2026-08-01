import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Bell,
  BarChart3,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  HandHeart,
  Heart,
  LayoutDashboard,
  Megaphone,
  Phone,
  UserCog,
  Users,
  UsersRound,
} from 'lucide-react';

export interface GuideCommonQuestion {
  q: string;
  a: string;
}

export interface GuideTroubleshootingItem {
  symptom: string;
  fix: string;
}

export interface GuideRelatedPage {
  label: string;
  path: string;
}

export interface GuideFeature {
  icon: LucideIcon;
  title: string;
  path: string;
  description: string;
  steps: string[];
  tip?: string;
  /** Secondary routes this same entry covers (e.g. a detail or sub-page). */
  relatedPaths?: string[];
  /** Role display names that can do this — drives the role filter. */
  whoCanDoThis?: string[];
  /** Things that must be true/configured before this feature works. */
  prerequisites?: string[];
  commonQuestions?: GuideCommonQuestion[];
  troubleshooting?: GuideTroubleshootingItem[];
  /** Cross-links to entries/pages that live elsewhere in the guide. */
  relatedPages?: GuideRelatedPage[];
  /** Extra search terms that don't appear verbatim in title/description. */
  keywords?: string[];
}

export interface GuideGroup {
  header?: string;
  features: GuideFeature[];
}

export const quickStart = [
  { label: 'Check Dashboard', detail: 'for what needs attention today' },
  { label: 'Open My Follow-Ups', detail: 'pick the next member in queue' },
  { label: 'Review their profile', detail: 'attendance, notes, prior contact' },
  { label: 'Call, using a Call Guide', detail: 'for the right talking points' },
  { label: 'Log the outcome', detail: 'reached, no answer, or needs care' },
  { label: 'Escalate if needed', detail: 'hand serious needs to a pastor' },
];

const ROLE_SUPER_ADMIN = 'Super Admin';
const ROLE_PASTOR = 'Pastor';
const ROLE_ADMIN = 'Administrator';
const ROLE_TEAM_LEAD = 'Team Lead';
const ROLE_FOLLOW_UP_WORKER = 'Follow-Up Worker';
const ROLE_COMMS_MANAGER = 'Communications Manager';
const ROLE_AUDITOR = 'Auditor';
const ROLE_VIEWER = 'Viewer';

/**
 * Canonical role display names, in the order they should appear in the role filter.
 * These are the eight roles seeded in the backend — note that ROLE_NAMES in
 * src/lib/constants.ts is stale (six entries, and 'ADMIN' instead of 'ADMINISTRATOR'),
 * so it is deliberately not used as the source here.
 */
export const ALL_GUIDE_ROLES = [
  ROLE_SUPER_ADMIN,
  ROLE_PASTOR,
  ROLE_ADMIN,
  ROLE_TEAM_LEAD,
  ROLE_FOLLOW_UP_WORKER,
  ROLE_COMMS_MANAGER,
  ROLE_AUDITOR,
  ROLE_VIEWER,
];

export const guideGroups: GuideGroup[] = [
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
          'Check the recent activity feed for escalations or completions your team logged since you last looked.',
          'Use this page as your first stop each session — it tells you where the day\'s attention should go before you open any single list.',
        ],
        tip: "The dashboard reflects only your team's scope unless you have a broader role — Pastors and Admins see church-wide numbers, everyone else sees their own team's slice.",
        whoCanDoThis: [ROLE_SUPER_ADMIN, ROLE_PASTOR, ROLE_ADMIN, ROLE_TEAM_LEAD, ROLE_FOLLOW_UP_WORKER, ROLE_VIEWER, ROLE_AUDITOR],
        relatedPages: [
          { label: 'Notifications', path: '/notifications' },
          { label: 'My Follow-Ups', path: '/follow-ups' },
        ],
        keywords: ['home', 'overview', 'kpis', 'stats'],
      },
      {
        icon: ClipboardCheck,
        title: 'My Follow-Ups',
        path: '/follow-ups',
        relatedPaths: ['/follow-ups/cycles'],
        description:
          'The actual work queue — every member assigned to you who needs a call, text, or visit. This is where a typical session starts. Follow-Up Cycles (a weekly batch of tasks with a start/end date) group the queue so leaders can track a week\'s progress as a whole.',
        steps: [
          'Filter by status (open, overdue) or priority if the list is long.',
          "Click a member's name to open their full profile.",
          'After contact, log the outcome directly from the follow-up record — reached, no answer, voicemail, or needs pastoral care.',
          'Add a note so the next person (or you, next week) has context.',
          'Need someone else to handle it? Use Reassign — pick a team to narrow the list, and its leaders appear at the top.',
        ],
        tip: "A cleared queue doesn't mean you're done — new follow-ups get assigned automatically as visitors and members move through their journey stage.",
        whoCanDoThis: [ROLE_SUPER_ADMIN, ROLE_PASTOR, ROLE_ADMIN, ROLE_TEAM_LEAD, ROLE_FOLLOW_UP_WORKER],
        prerequisites: ['A member must be assigned to you (directly or via your team) to appear in your queue.'],
        commonQuestions: [
          {
            q: 'What is a Follow-Up Cycle, and do I need to use it?',
            a: 'A cycle is a named week (e.g. "Week of Aug 3") with a start and end date that tasks get grouped under. Team Leads and above can open, activate, and close cycles under Follow-Up Cycles to track completion rate week over week — most callers never need to touch it directly.',
          },
        ],
        relatedPages: [{ label: 'Call Guides', path: '/call-guides' }],
        keywords: ['queue', 'tasks', 'calls', 'cycles', 'reassign'],
      },
      {
        icon: Users,
        title: 'Members',
        path: '/members',
        relatedPaths: ['/members/import', '/members/duplicates'],
        description:
          'The full member and visitor directory. Search by name, email, or phone; filter by gender, department, cell group, visitor journey stage, or first-timer status.',
        steps: [
          'Search or filter to find someone outside your assigned queue.',
          'Open a profile to see contact info, household, attendance history, and past follow-ups across every tab.',
          'Use Edit to correct contact details, journey stage, cell group, or add pastoral notes.',
          'Use Import to bulk-load a spreadsheet of new visitors, or Duplicates to merge accidental repeats.',
        ],
        tip: '"Cell Group" is this church\'s term for what the system used to label "Fellowship Group" — same field, renamed everywhere in the UI.',
        whoCanDoThis: [ROLE_SUPER_ADMIN, ROLE_PASTOR, ROLE_ADMIN, ROLE_TEAM_LEAD, ROLE_FOLLOW_UP_WORKER, ROLE_VIEWER, ROLE_AUDITOR],
        troubleshooting: [
          {
            symptom: 'An import fails or skips rows.',
            fix: 'Check that required columns (first name, last name, and at least one contact method) are present, then use Duplicates afterward to catch anything that matched an existing record.',
          },
        ],
        relatedPages: [
          { label: 'Departments', path: '/admin/departments' },
          { label: 'Cell Groups', path: '/admin/fellowship-groups' },
        ],
        keywords: ['directory', 'visitors', 'search', 'import', 'duplicates', 'household'],
      },
      {
        icon: UsersRound,
        title: 'Teams',
        path: '/teams',
        description:
          'Groups of staff or volunteers who share a follow-up workload — e.g. a "New Converts" team or a "First Timer Callers" team. This is also where you name a team\'s leader.',
        steps: [
          'Open a team to see its workers and assigned follow-up load.',
          'Click Assign Member, pick the person, and set their role to Leader to make them the team leader.',
          'Leaders show up first in the "Assign to" list whenever a follow-up is created or reassigned for that team.',
        ],
        tip: 'A team leader also needs a login with the Team Lead role — see Users, Roles & Settings below.',
        whoCanDoThis: [ROLE_SUPER_ADMIN, ROLE_PASTOR, ROLE_ADMIN, ROLE_TEAM_LEAD],
        relatedPages: [{ label: 'Users, Roles & Settings', path: '/admin/users' }],
        keywords: ['workers', 'leader', 'assign'],
      },
      {
        icon: CalendarCheck,
        title: 'Services & Attendance',
        path: '/services',
        relatedPaths: ['/services/:id'],
        description:
          'Create a service (e.g. "Sunday Service, Aug 3"), then check members in. Attendance feeds each member\'s history and their "last attended" date automatically.',
        steps: [
          'Click New Service and give it a name, date, and type.',
          'Open the service, then search for members and tap each one to mark them present.',
          'Tap again to undo. Everything saves as you tap — there is no separate save button.',
          "See any one person's full history on their profile under the Attendance tab.",
        ],
        tip: 'Marking someone present also updates their Last Attendance date, which is what drives absentee follow-ups.',
        whoCanDoThis: [ROLE_SUPER_ADMIN, ROLE_PASTOR, ROLE_ADMIN, ROLE_TEAM_LEAD],
        keywords: ['check-in', 'roll call', 'sunday service'],
      },
      {
        icon: AlertTriangle,
        title: 'Escalations',
        path: '/escalations',
        relatedPaths: ['/escalations/:id'],
        description:
          "Anything that needs a pastor or leader's attention rather than a routine follow-up — a crisis, a serious prayer need, or a member who's been unreachable too long.",
        steps: [
          'From any member profile, click Escalate and describe the concern.',
          'Leadership sees it land here immediately and can claim or resolve it.',
          'Open an escalation to add pastoral notes as the situation develops — these notes stay attached to the escalation, not the public follow-up record.',
          'Mark it Resolved once it has been handled, or Claim it first if several leaders could otherwise pick it up at once.',
        ],
        tip: 'Escalating does not remove the member from your regular follow-up queue — it runs alongside it, as a separate, higher-visibility thread for leadership.',
        whoCanDoThis: [ROLE_SUPER_ADMIN, ROLE_PASTOR, ROLE_ADMIN, ROLE_TEAM_LEAD, ROLE_FOLLOW_UP_WORKER],
        commonQuestions: [
          {
            q: 'Who sees an escalation once I raise it?',
            a: 'Pastors and Admins see all escalations. Team Leads typically see escalations raised within their own team unless given broader access.',
          },
        ],
        keywords: ['crisis', 'urgent', 'claim', 'resolve', 'pastoral note'],
      },
      {
        icon: Bell,
        title: 'Notifications',
        path: '/notifications',
        description:
          'Your personal in-app notification center — new assignments, escalations raised on your team, and system alerts land here.',
        steps: [
          'Open Notifications to see everything routed to you, newest first.',
          'Click a notification to jump straight to the record it refers to (a follow-up, escalation, or campaign).',
          'Mark items read as you clear them, or mark all read to reset the counter.',
        ],
        tip: 'The bell icon in the top bar mirrors this page and always shows your unread count — you don\'t need to open the full page just to check if something new came in.',
        whoCanDoThis: [ROLE_SUPER_ADMIN, ROLE_PASTOR, ROLE_ADMIN, ROLE_TEAM_LEAD, ROLE_FOLLOW_UP_WORKER, ROLE_VIEWER],
        keywords: ['bell', 'alerts', 'unread'],
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
        relatedPaths: ['/campaigns/new', '/campaigns/:id/analytics'],
        description:
          'A bigger, scheduled outreach push to a defined recipient list — e.g. an Easter invite or a foundation-school reminder — as opposed to Encouragements, which are short, one-off pastoral nudges. Campaigns are email-only: recipients are resolved to members who have an email address on file and have given consent to be emailed.',
        steps: [
          'Setup — name the campaign, write the subject line, and optionally attach it to a team.',
          'Content — build the email in the WYSIWYG editor (with a plain-text fallback for clients that block HTML). Insert an image inline via the Media Library if you\'ve uploaded one.',
          'Recipients — build the audience with the segment selector (by criteria, not a hand-picked list like Encouragements).',
          'Review & Send — check the preview and recipient count, then send now or schedule for later.',
          'Submit for approval. Every campaign needs sign-off before it sends or is scheduled — there is no self-send shortcut, even for Pastors.',
        ],
        tip: 'Recipient counts are usually smaller than the full segment because of the email-consent filter — a member only receives a campaign if they have an email on file AND have consented to email communication. If a campaign "reached fewer people than expected," check consent first.',
        whoCanDoThis: [ROLE_SUPER_ADMIN, ROLE_PASTOR, ROLE_ADMIN, ROLE_TEAM_LEAD, ROLE_COMMS_MANAGER],
        prerequisites: ['Recipients need an email address on file and email communication consent to be included.'],
        commonQuestions: [
          {
            q: 'Should I send this as a Campaign or an Encouragement?',
            a: 'Use Encouragements for a short, personal-feeling, one-off message — it can go out by In-App, Email, or SMS, and a Pastor sending their own message can skip approval. Use a Campaign for a bigger, scheduled push to a defined list, such as an event invite — Campaigns are email-only and always require approval before sending.',
          },
          {
            q: 'Can I still edit a campaign after creating it?',
            a: 'Yes, as long as it\'s still in Draft status — the Edit button reopens the same 4-step builder. Once it moves past Draft (submitted, approved, scheduled, or sent), the builder becomes read-only and shows a "cannot edit" screen instead.',
          },
          {
            q: 'Where do I see how a campaign performed?',
            a: 'Open the campaign and go to its Analytics page for delivery, open, click, bounce, and unsubscribe counts, plus who approved and sent it.',
          },
        ],
        troubleshooting: [
          {
            symptom: 'Recipient count looks too low for the segment I picked.',
            fix: 'Campaigns only reach members with an email on file who have also consented to email communication. Check the segment preview and the members\' communication preferences.',
          },
          {
            symptom: 'The Send button is missing or disabled.',
            fix: 'The campaign hasn\'t been approved yet. Approval is required server-side for every campaign — submit it for approval first, then send or schedule once approved.',
          },
        ],
        relatedPages: [{ label: 'Encouragements', path: '/encouragements' }],
        keywords: ['email', 'outreach', 'blast', 'wysiwyg', 'analytics', 'approval', 'consent', 'segment'],
      },
      {
        icon: Heart,
        title: 'Encouragements',
        path: '/encouragements',
        relatedPaths: ['/encouragements/new', '/encouragements/cards', '/encouragements/cards/manage'],
        description:
          'Quick, personal-feeling messages — a scripture, a short word — sent In-App, by Email, or by SMS. Also where printable encouragement cards live.',
        steps: [
          'Write the message and optionally attach a scripture reference.',
          'Pick delivery channels — In-App and Email always deliver; SMS delivers once Twilio is configured; Push is not yet live.',
          'Choose the audience: All Members, By Criteria (department, cell group, team, first-timers), or Specific Members you search and hand-pick.',
          'Send now or schedule for later.',
          'Need physical cards for ushers to hand out? Go to Print Cards to lay out and print pre-made encouragement card templates, or Manage Card Templates to add or edit the templates themselves.',
        ],
        tip: 'A member only receives SMS/Email if they\'ve given consent for that channel in their message preferences — check there first if a send comes back "skipped".',
        whoCanDoThis: [ROLE_SUPER_ADMIN, ROLE_PASTOR, ROLE_ADMIN, ROLE_TEAM_LEAD, ROLE_COMMS_MANAGER],
        prerequisites: ['SMS requires Twilio to be configured for this church.'],
        commonQuestions: [
          {
            q: 'Does an encouragement need approval before it sends?',
            a: 'Only if you are not the Pastor. A Pastor sending their own message can send immediately; other roles route through the same approval step Campaigns use.',
          },
        ],
        relatedPages: [{ label: 'Campaigns', path: '/campaigns' }],
        keywords: ['nudge', 'scripture', 'sms', 'cards', 'print', 'templates'],
      },
      {
        icon: HandHeart,
        title: 'Prayer Requests',
        path: '/prayer-requests',
        relatedPaths: ['/prayer-requests/dashboard'],
        description:
          'Requests submitted through the public prayer request form (no login needed) land here for staff to see and follow up on. The Prayer Dashboard rolls them up into at-a-glance counts — new, urgent, not yet prayed for, and answered.',
        steps: [
          'Review new requests as they come in, or start from the Prayer Dashboard for a prioritized view.',
          'Mark as prayed for, or convert to a follow-up if it needs a personal call.',
          'Submitters can mark a request Confidential or Pastor Only — those are locked to Pastor-role accounts.',
        ],
        tip: 'On a locked request, everyone else sees only the category and status — the text, the name, and all actions are hidden.',
        whoCanDoThis: [ROLE_SUPER_ADMIN, ROLE_PASTOR, ROLE_ADMIN, ROLE_TEAM_LEAD, ROLE_FOLLOW_UP_WORKER],
        keywords: ['dashboard', 'confidential', 'pastor only', 'public form'],
      },
      {
        icon: GraduationCap,
        title: 'Foundation School',
        path: '/foundation-school',
        relatedPaths: ['/foundation-school/:id'],
        description:
          "Foundation School is the 7-class course every new convert and new member takes before joining the church fully, ending in a graduation. It tracks new converts through the curriculum from enrollment to graduation.",
        steps: [
          'Start a new Batch when a fresh group of new converts is ready to begin — name it like "Foundation School Batch — August 2026" and pick a start date.',
          'Enrol each new convert or new member into that Batch.',
          'As the teacher, tick off each of the 7 classes for each student as they attend, week by week.',
          'Once a student has completed all 7 classes, the Graduate button unlocks — mark them graduated.',
        ],
        tip: "Foundation School doesn't require students to log in or mark themselves — the teacher marks attendance for the whole group from this page.",
        whoCanDoThis: [ROLE_SUPER_ADMIN, ROLE_PASTOR, ROLE_ADMIN, ROLE_TEAM_LEAD],
        keywords: ['batch', 'new convert', 'graduation', 'class', 'enrol', 'enroll'],
      },
      {
        icon: BarChart3,
        title: 'Reports',
        path: '/reports',
        description:
          'Roll-up views of follow-up performance — response rates, first-timer retention, escalation volume — filterable by department, cell group, or date range.',
        steps: [
          'Pick the report you need — follow-up performance, first-timer retention, or escalation volume.',
          'Filter to the slice you care about: department, cell group, team, or a date range.',
          'Read the summary tiles first, then drill into the chart or table below for the detail behind them.',
          'Export or share the numbers with leadership.',
        ],
        tip: 'Numbers are scoped to what your role can already see — a Team Lead\'s report reflects their team, while Pastors and Admins see church-wide figures.',
        whoCanDoThis: [ROLE_SUPER_ADMIN, ROLE_PASTOR, ROLE_ADMIN, ROLE_TEAM_LEAD, ROLE_AUDITOR],
        keywords: ['kpi', 'analytics', 'export', 'retention', 'response rate'],
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
        relatedPaths: ['/call-guides/:id'],
        description:
          'Pre-written scripts for common calls — first-timer welcome, missed-service check-in, new-convert follow-up — so callers stay warm and consistent.',
        steps: [
          'Open the guide that matches the reason for the call, right before dialing.',
          'Follow the prompts, but personalize where you can — use the member\'s name and any notes from their profile.',
          'If you\'re an Admin or Pastor, use the guide editor to add a new script or update wording that\'s gone stale.',
          'Keep guides short — callers read these live, mid-conversation.',
        ],
        tip: 'A good call guide has an opening line, two or three talking points, and a suggested close — not a full transcript to read verbatim.',
        whoCanDoThis: [ROLE_SUPER_ADMIN, ROLE_PASTOR, ROLE_ADMIN, ROLE_TEAM_LEAD, ROLE_FOLLOW_UP_WORKER],
        relatedPages: [{ label: 'My Follow-Ups', path: '/follow-ups' }],
        keywords: ['script', 'talking points', 'phone'],
      },
      {
        icon: Building2,
        title: 'Departments',
        path: '/admin/departments',
        description:
          'Ministry departments members belong to — Ushering, Media, and similar. Separate from Cell Groups, which have their own page.',
        steps: [
          'Add or rename a department here.',
          'This list powers the department filter everywhere else in the app — Members, Encouragements, Reports.',
        ],
        tip: 'Renaming a department updates it everywhere immediately — existing member assignments are preserved.',
        whoCanDoThis: [ROLE_SUPER_ADMIN, ROLE_PASTOR, ROLE_ADMIN],
        relatedPages: [{ label: 'Cell Groups', path: '/admin/fellowship-groups' }],
        keywords: ['ministry', 'ushering', 'media'],
      },
      {
        icon: UsersRound,
        title: 'Cell Groups',
        path: '/admin/fellowship-groups',
        description:
          'The church\'s cell groups — Noble, Prosperous, Impact, New Creation, Delightsome, Arise & Shine, Praise, Zera, and Phronesis Cell. Separate from Departments, which have their own page.',
        steps: [
          'Add or rename a cell group here.',
          'This list powers the cell group filter everywhere else in the app — Members, Encouragements, Reports.',
        ],
        tip: '"Cell Group" is this church\'s term for what the system used to label "Fellowship Group" — same field, renamed everywhere in the UI.',
        whoCanDoThis: [ROLE_SUPER_ADMIN, ROLE_PASTOR, ROLE_ADMIN],
        relatedPages: [{ label: 'Departments', path: '/admin/departments' }],
        keywords: ['fellowship group', 'cell', 'noble', 'prosperous', 'impact'],
      },
      {
        icon: UserCog,
        title: 'Users, Roles & Settings',
        path: '/admin/users',
        relatedPaths: ['/admin/roles', '/admin/settings', '/admin/audit-logs'],
        description:
          "Staff accounts, permission roles, church-wide settings (like birthday reminders), and the audit log of who changed what.",
        steps: [
          'To give someone a login: Users -> Add User -> enter their name, email, and a temporary password, then tick a role before saving.',
          'Roles available include Super Admin, Pastor, Admin, Team Lead, Follow-Up Worker, and Viewer.',
          'Pick Team Lead for cell/team leaders — it lets them view members, run follow-ups, and assign or reassign work.',
          'Only Pastor can open prayer requests marked Confidential or Pastor Only.',
          'Adjust what any role can see or do under Roles, and check Audit Logs to trace who changed what.',
        ],
        tip: 'Share the temporary password with the person directly and ask them to change it — there is no automatic invite email yet.',
        whoCanDoThis: [ROLE_SUPER_ADMIN, ROLE_ADMIN],
        commonQuestions: [
          {
            q: 'What\'s the difference between Users, Roles, and Audit Logs?',
            a: 'Users is where you create logins and assign each person a role. Roles is where you define what each role is allowed to see or do. Audit Logs is a read-only history of who changed what and when, across the whole app.',
          },
        ],
        keywords: ['permissions', 'accounts', 'audit log', 'settings', 'password', 'birthday reminders'],
      },
    ],
  },
];
