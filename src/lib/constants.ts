import type { UserRole } from '@/types';

export const ROLE_NAMES: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  PASTOR: 'Pastor',
  ADMINISTRATOR: 'Administrator',
  TEAM_LEAD: 'Team Lead',
  FOLLOW_UP_WORKER: 'Follow-Up Worker',
  COMMUNICATIONS_MANAGER: 'Communications Manager',
  AUDITOR: 'Auditor',
  VIEWER: 'Viewer',
  MEMBER: 'Member',
  USHER: 'Usher',
  FOUNDATION_SCHOOL_TEACHER: 'Foundation School Teacher',
} as const;

export const MEMBER_STATUS = [
  { label: 'New', value: 'NEW', color: 'bg-blue-100 text-blue-800', icon: 'UserPlus' },
  { label: 'Active', value: 'ACTIVE', color: 'bg-emerald-100 text-emerald-800', icon: 'UserCheck' },
  { label: 'Inactive', value: 'INACTIVE', color: 'bg-gray-100 text-gray-800', icon: 'UserX' },
  { label: 'First Timer', value: 'FIRST_TIMER', color: 'bg-purple-100 text-purple-800', icon: 'Star' },
  { label: 'Second Timer', value: 'SECOND_TIMER', color: 'bg-indigo-100 text-indigo-800', icon: 'Stars' },
  { label: 'Regular', value: 'REGULAR', color: 'bg-teal-100 text-teal-800', icon: 'Users' },
  { label: 'Worker', value: 'WORKER', color: 'bg-amber-100 text-amber-800', icon: 'Wrench' },
] as const;

export const FOLLOW_UP_STATUS = [
  { label: 'Pending', value: 'PENDING', color: 'bg-yellow-100 text-yellow-800', icon: 'Clock' },
  { label: 'In Progress', value: 'IN_PROGRESS', color: 'bg-blue-100 text-blue-800', icon: 'Loader' },
  { label: 'Completed', value: 'COMPLETED', color: 'bg-emerald-100 text-emerald-800', icon: 'CheckCircle' },
  { label: 'Missed', value: 'MISSED', color: 'bg-red-100 text-red-800', icon: 'XCircle' },
  { label: 'Escalated', value: 'ESCALATED', color: 'bg-orange-100 text-orange-800', icon: 'AlertTriangle' },
] as const;

export const TASK_PRIORITY = [
  { label: 'Low', value: 'LOW', color: 'bg-slate-100 text-slate-800', icon: 'ArrowDown' },
  { label: 'Medium', value: 'MEDIUM', color: 'bg-yellow-100 text-yellow-800', icon: 'ArrowRight' },
  { label: 'High', value: 'HIGH', color: 'bg-orange-100 text-orange-800', icon: 'ArrowUp' },
  { label: 'Urgent', value: 'URGENT', color: 'bg-red-100 text-red-800', icon: 'AlertCircle' },
] as const;

export const CHANNELS = [
  { label: 'Phone Call', value: 'PHONE_CALL', icon: 'Phone' },
  { label: 'SMS', value: 'SMS', icon: 'MessageSquare' },
  { label: 'WhatsApp', value: 'WHATSAPP', icon: 'MessageCircle' },
  { label: 'Email', value: 'EMAIL', icon: 'Mail' },
  { label: 'In Person', value: 'IN_PERSON', icon: 'Users' },
  { label: 'Home Visit', value: 'HOME_VISIT', icon: 'Home' },
] as const;

export const OUTCOMES = [
  { label: 'Reached - Positive', value: 'REACHED_POSITIVE', color: 'bg-emerald-100 text-emerald-800' },
  { label: 'Reached - Neutral', value: 'REACHED_NEUTRAL', color: 'bg-blue-100 text-blue-800' },
  { label: 'Reached - Negative', value: 'REACHED_NEGATIVE', color: 'bg-orange-100 text-orange-800' },
  { label: 'Not Reached', value: 'NOT_REACHED', color: 'bg-gray-100 text-gray-800' },
  { label: 'Voicemail', value: 'VOICEMAIL', color: 'bg-yellow-100 text-yellow-800' },
  { label: 'Wrong Number', value: 'WRONG_NUMBER', color: 'bg-red-100 text-red-800' },
  { label: 'Requested Callback', value: 'REQUESTED_CALLBACK', color: 'bg-purple-100 text-purple-800' },
] as const;

export const ESCALATION_TYPES = [
  { label: 'Pastoral Need', value: 'PASTORAL_NEED', icon: 'Heart' },
  { label: 'Prayer Request', value: 'PRAYER_REQUEST', icon: 'HandHeart' },
  { label: 'Crisis', value: 'CRISIS', icon: 'AlertOctagon' },
  { label: 'Medical', value: 'MEDICAL', icon: 'Activity' },
  { label: 'Financial', value: 'FINANCIAL', icon: 'DollarSign' },
  { label: 'Family', value: 'FAMILY', icon: 'Home' },
  { label: 'Spiritual Distress', value: 'SPIRITUAL_DISTRESS', icon: 'Flame' },
] as const;

export const ESCALATION_PRIORITY = [
  { label: 'Low', value: 'LOW', color: 'bg-slate-100 text-slate-800', icon: 'ArrowDown' },
  { label: 'Medium', value: 'MEDIUM', color: 'bg-yellow-100 text-yellow-800', icon: 'ArrowRight' },
  { label: 'High', value: 'HIGH', color: 'bg-orange-100 text-orange-800', icon: 'ArrowUp' },
  { label: 'Critical', value: 'CRITICAL', color: 'bg-red-100 text-red-800', icon: 'AlertCircle' },
] as const;

export const CAMPAIGN_STATUS = [
  { label: 'Draft', value: 'DRAFT', color: 'bg-gray-100 text-gray-800', icon: 'FileEdit' },
  { label: 'Scheduled', value: 'SCHEDULED', color: 'bg-blue-100 text-blue-800', icon: 'Calendar' },
  { label: 'Sending', value: 'SENDING', color: 'bg-yellow-100 text-yellow-800', icon: 'Send' },
  { label: 'Sent', value: 'SENT', color: 'bg-emerald-100 text-emerald-800', icon: 'CheckCircle' },
  { label: 'Failed', value: 'FAILED', color: 'bg-red-100 text-red-800', icon: 'XCircle' },
] as const;

export const PERMISSIONS = [
  'members.view',
  'members.create',
  'members.edit',
  'members.delete',
  'teams.view',
  'teams.manage',
  'follow_ups.view',
  'follow_ups.manage',
  'escalations.view',
  'escalations.manage',
  'campaigns.view',
  'campaigns.manage',
  'reports.view',
  'admin.users',
  'admin.roles',
  'admin.settings',
  'admin.audit',
] as const;
