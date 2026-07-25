import type { AxiosResponse } from 'axios';
import api from '@/config/api';

// ─── Shared row shapes (subset of fields actually selected by the backend) ──

export interface DashboardMemberRef {
  id: string;
  firstName: string;
  lastName: string;
  phonePrimary?: string | null;
  email?: string | null;
}

export interface DashboardUserRef {
  id: string;
  firstName: string;
  lastName: string;
}

export interface DashboardFollowUpTask {
  id: string;
  memberId: string;
  teamId: string | null;
  assignedUserId: string | null;
  reasonCode: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: string;
  dueAt: string;
  firstAttemptAt: string | null;
  completedAt: string | null;
  reviewedAt: string | null;
  member: DashboardMemberRef;
  assignedUser?: DashboardUserRef | null;
  callGuide?: { id: string; name: string } | null;
}

export interface DashboardEscalation {
  id: string;
  memberId: string;
  category: string;
  priority: string;
  status: string;
  summary: string;
  createdAt: string;
  member: DashboardUserRef;
}

// ─── GET /dashboard (ministry-wide, requires dashboard.view_all) ───────────

export interface PastorDashboardKPIs {
  totalMembers: number;
  firstTimers: number;
  membersRequiringFollowUpThisWeek: number;
  completedFollowUps: number;
  notStartedFollowUps: number;
  attemptedNotReached: number;
  overdueFollowUps: number;
  escalatedFollowUps: number;
  openEscalations: number;
  resolvedEscalations: number;
  membersPlanningToReturn: number;
}

export interface TeamCompletionRate {
  teamId: string;
  teamName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export interface PastorDashboard {
  kpis: PastorDashboardKPIs;
  followUpTasksByStatus: Record<string, number>;
  escalationsByPriority: Record<string, number>;
  teamCompletionRates: TeamCompletionRate[];
}

// ─── GET /dashboard/me (personalized: team-leader view or worker view) ─────

export interface WorkerByTeam {
  userId: string;
  name: string;
  taskCount: number;
  completedCount: number;
  overdueCount: number;
}

export interface TeamLeaderDashboard {
  role: 'TEAM_LEADER';
  isTeamLeader: true;
  teamIds: string[];
  workload: { total: number; byStatus: Record<string, number> };
  tasksByWorker: WorkerByTeam[];
  overdueTasks: DashboardFollowUpTask[];
  workersWithNoActivity: DashboardUserRef[];
  membersAwaitingNextFollowUp: DashboardFollowUpTask[];
  pendingReview: DashboardFollowUpTask[];
  teamEscalations: DashboardEscalation[];
}

export interface NotATeamLeaderDashboard {
  role: 'TEAM_LEADER';
  isTeamLeader: false;
}

export interface WorkerDashboard {
  role: 'WORKER';
  dueToday: DashboardFollowUpTask[];
  overdue: DashboardFollowUpTask[];
  upcoming: DashboardFollowUpTask[];
  recentlyCompleted: DashboardFollowUpTask[];
  returnedForCorrection: DashboardFollowUpTask[];
}

export type PersonalizedDashboard = TeamLeaderDashboard | NotATeamLeaderDashboard | WorkerDashboard;

// ─── GET /dashboard/contact-completeness ────────────────────────────────────

export interface ContactCompletenessSummary {
  totalMembers: number;
  missingPhone: number;
  missingEmail: number;
  missingBoth: number;
  completeContacts: number;
  completePercentage: number;
}

export const dashboardApi = {
  getDashboard(): Promise<AxiosResponse<PastorDashboard>> {
    return api.get('/dashboard');
  },

  getMyDashboard(): Promise<AxiosResponse<PersonalizedDashboard>> {
    return api.get('/dashboard/me');
  },

  getContactCompleteness(): Promise<AxiosResponse<ContactCompletenessSummary>> {
    return api.get('/dashboard/contact-completeness');
  },
};
