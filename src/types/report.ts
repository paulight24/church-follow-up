/** Shared filter set accepted by every /reports/* endpoint (reportQuerySchema on the backend). */
export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  teamId?: string;
  leaderUserId?: string;
  workerUserId?: string;
  departmentId?: string;
  fellowshipGroupId?: string;
  status?: string;
  priority?: string;
  limit?: string;
}

export interface FollowUpReportRow {
  taskId: string;
  memberName: string;
  membershipStatus: string;
  team: string;
  assignedWorker: string;
  reasonCode: string;
  priority: string;
  status: string;
  dueAt: string;
  firstAttemptAt: string;
  completedAt: string;
}

export interface FollowUpReportSummary {
  total: number;
  completed: number;
  completionRate: number;
  avgDaysToFirstAttempt: number;
  byStatus: Array<{ status: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
  byReasonCode: Array<{ reasonCode: string; count: number }>;
}

export interface FollowUpReport {
  summary: FollowUpReportSummary;
  rows: FollowUpReportRow[];
}

export interface MemberReportRow {
  memberId: string;
  firstName: string;
  lastName: string;
  membershipStatus: string;
  department: string;
  fellowshipGroup: string;
  visitorJourneyStage: string;
  isFirstTimer: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
  createdAt: string;
}

export interface MemberReportSummary {
  total: number;
  firstTimers: number;
  byMembershipStatus: Array<{ membershipStatusId: string | null; name: string; count: number }>;
  byJourneyStage: Array<{ stage: string; count: number }>;
}

export interface MemberReport {
  summary: MemberReportSummary;
  rows: MemberReportRow[];
}

export interface TeamPerformanceReportRow {
  teamId: string;
  teamName: string;
  leaderName: string;
  workerCount: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface TeamPerformanceReport {
  summary: { teamCount: number };
  rows: TeamPerformanceReportRow[];
}

export interface ContactCompletenessReportRow {
  memberId: string;
  firstName: string;
  lastName: string;
  department: string;
  fellowshipGroup: string;
  missingPhone: boolean;
  missingEmail: boolean;
}

export interface ContactCompletenessReport {
  summary: {
    totalMembers: number;
    missingContactCount: number;
    completePercentage: number;
  };
  rows: ContactCompletenessReportRow[];
}

export interface OverdueTasksReportRow {
  taskId: string;
  memberName: string;
  team: string;
  assignedWorker: string;
  priority: string;
  status: string;
  dueAt: string;
  daysOverdue: number;
}

export interface OverdueTasksReport {
  summary: { total: number };
  rows: OverdueTasksReportRow[];
}

export type ReportType =
  | 'follow-ups'
  | 'members'
  | 'team-performance'
  | 'contact-completeness'
  | 'overdue-tasks';

export type AnyReport =
  | FollowUpReport
  | MemberReport
  | TeamPerformanceReport
  | ContactCompletenessReport
  | OverdueTasksReport;
