import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  UsersRound,
  UserPlus,
  Heart,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { formatRelativeDate } from '@/lib/formatters';
import { dashboardApi } from '../api/dashboard.api';
import type { DashboardFollowUpTask, DashboardEscalation } from '../api/dashboard.api';
import { KPICard } from '../components/KPICard';
import { OverdueTasksTable } from '../components/OverdueTasksTable';
import type { OverdueTaskRow } from '../components/OverdueTasksTable';
import { TeamCompletionChart } from '../components/TeamCompletionChart';
import type { TeamCompletionDatum } from '../components/TeamCompletionChart';
import { ActivityFeed } from '../components/ActivityFeed';
import type { ActivityItem } from '../components/ActivityFeed';
import { EscalationSummary } from '../components/EscalationSummary';
import type { EscalationListItem } from '../components/EscalationSummary';

function taskMemberName(task: DashboardFollowUpTask): string {
  return `${task.member.firstName} ${task.member.lastName}`;
}

function toOverdueRow(task: DashboardFollowUpTask, assignedToName: string): OverdueTaskRow {
  return {
    id: task.id,
    memberName: taskMemberName(task),
    assignedToName,
    dueDate: task.dueAt,
    priority: task.priority,
  };
}

function toEscalationItem(escalation: DashboardEscalation): EscalationListItem {
  return {
    id: escalation.id,
    title: `${escalation.member.firstName} ${escalation.member.lastName} — ${escalation.category.replace(/_/g, ' ')}`,
    category: escalation.category,
    priority: escalation.priority,
    createdAt: escalation.createdAt,
  };
}

function toActivityItem(
  task: DashboardFollowUpTask,
  description: string,
  icon: ActivityItem['icon'],
  iconColor: string,
  timestamp: string | null,
): ActivityItem {
  return {
    id: task.id,
    icon,
    iconColor,
    description,
    user: taskMemberName(task),
    timeAgo: timestamp ? formatRelativeDate(timestamp) : '—',
  };
}

export function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.firstName ?? 'there';
  const canViewAll = usePermission('dashboard.view_all');

  const pastorQuery = useQuery({
    queryKey: ['dashboard', 'pastor'],
    queryFn: () => dashboardApi.getDashboard().then((res) => res.data),
    enabled: canViewAll,
  });

  const meQuery = useQuery({
    queryKey: ['dashboard', 'me'],
    queryFn: () => dashboardApi.getMyDashboard().then((res) => res.data),
  });

  const contactQuery = useQuery({
    queryKey: ['dashboard', 'contact-completeness'],
    queryFn: () => dashboardApi.getContactCompleteness().then((res) => res.data),
    enabled: canViewAll,
  });

  const pastorData = pastorQuery.data;
  const meData = meQuery.data;
  const isTeamLeader = meData?.role === 'TEAM_LEADER' && meData.isTeamLeader;
  const isWorker = meData?.role === 'WORKER';

  // ─── KPI cards: ministry-wide when permitted, else derived from the caller's own workload ───
  const kpiLoading = (canViewAll && pastorQuery.isLoading) || meQuery.isLoading;

  const kpiCards = pastorData
    ? [
        { title: 'Total Members', value: pastorData.kpis.totalMembers, icon: Users, color: 'indigo' as const },
        { title: 'First-Time Guests', value: pastorData.kpis.firstTimers, icon: UserPlus, color: 'sky' as const },
        {
          title: 'Not Started Follow-Ups',
          value: pastorData.kpis.notStartedFollowUps,
          icon: ClipboardCheck,
          color: 'amber' as const,
        },
        {
          title: 'Overdue Follow-Ups',
          value: pastorData.kpis.overdueFollowUps,
          icon: AlertTriangle,
          color: 'rose' as const,
        },
        {
          title: 'Completed Follow-Ups',
          value: pastorData.kpis.completedFollowUps,
          icon: CheckCircle2,
          color: 'emerald' as const,
        },
        {
          title: 'Open Escalations',
          value: pastorData.kpis.openEscalations,
          icon: ShieldAlert,
          color: 'purple' as const,
        },
        ...(contactQuery.data
          ? [
              {
                title: 'Contact Data Complete',
                value: `${contactQuery.data.completePercentage}%`,
                icon: UsersRound,
                color: 'sky' as const,
              },
            ]
          : []),
      ]
    : isTeamLeader && meData?.role === 'TEAM_LEADER' && meData.isTeamLeader
      ? [
          { title: 'Team Workload', value: meData.workload.total, icon: ClipboardCheck, color: 'indigo' as const },
          { title: 'Overdue Tasks', value: meData.overdueTasks.length, icon: AlertTriangle, color: 'rose' as const },
          { title: 'Pending Your Review', value: meData.pendingReview.length, icon: CheckCircle2, color: 'amber' as const },
          { title: 'Workers on Your Team', value: meData.tasksByWorker.length, icon: UsersRound, color: 'purple' as const },
          {
            title: 'Team Escalations',
            value: meData.teamEscalations.length,
            icon: ShieldAlert,
            color: 'sky' as const,
          },
        ]
      : isWorker && meData?.role === 'WORKER'
        ? [
            { title: 'Due Today', value: meData.dueToday.length, icon: ClipboardCheck, color: 'sky' as const },
            { title: 'Overdue', value: meData.overdue.length, icon: AlertTriangle, color: 'rose' as const },
            { title: 'Upcoming (7 days)', value: meData.upcoming.length, icon: UsersRound, color: 'indigo' as const },
            {
              title: 'Completed',
              value: meData.recentlyCompleted.length,
              icon: CheckCircle2,
              color: 'emerald' as const,
            },
            {
              title: 'Returned for Correction',
              value: meData.returnedForCorrection.length,
              icon: RotateCcw,
              color: 'amber' as const,
            },
          ]
        : [];

  // ─── Team completion chart: ministry-wide by team, or per-worker for team leads ───
  const teamCompletionData: TeamCompletionDatum[] = pastorData
    ? pastorData.teamCompletionRates.map((t) => ({ name: t.teamName, completion: t.completionRate }))
    : isTeamLeader && meData?.role === 'TEAM_LEADER' && meData.isTeamLeader
      ? meData.tasksByWorker.map((w) => ({
          name: w.name,
          completion: w.taskCount > 0 ? Math.round((w.completedCount / w.taskCount) * 100) : 0,
        }))
      : [];

  const teamCompletionTitle = pastorData ? 'Team Completion Rates' : 'Worker Completion Rates';
  const teamCompletionDescription = pastorData
    ? 'Follow-up task completion rate by team'
    : 'Follow-up task completion rate by worker on your team';

  // ─── Overdue tasks table: always sourced from the caller's own personalized view ───
  const overdueTasks: OverdueTaskRow[] =
    isTeamLeader && meData?.role === 'TEAM_LEADER' && meData.isTeamLeader
      ? meData.overdueTasks.map((t) => toOverdueRow(t, t.assignedUser ? `${t.assignedUser.firstName} ${t.assignedUser.lastName}` : 'Unassigned'))
      : isWorker && meData?.role === 'WORKER'
        ? meData.overdue.map((t) => toOverdueRow(t, 'You'))
        : [];

  // ─── Escalations: per-item detail for team leads, ministry-wide counts otherwise ───
  const escalationItems: EscalationListItem[] =
    isTeamLeader && meData?.role === 'TEAM_LEADER' && meData.isTeamLeader
      ? meData.teamEscalations.map(toEscalationItem)
      : [];

  const escalationCounts = pastorData
    ? Object.entries(pastorData.escalationsByPriority).map(([label, count]) => ({ label, count }))
    : undefined;

  // ─── Activity feed: repurposed from real per-task data (no activity-log endpoint exists) ───
  let activityItems: ActivityItem[] = [];
  let activityTitle = 'Recent Activity';
  if (isWorker && meData?.role === 'WORKER') {
    activityTitle = 'Your Recently Completed Follow-Ups';
    activityItems = meData.recentlyCompleted.map((t) =>
      toActivityItem(t, `Completed follow-up with ${taskMemberName(t)}`, CheckCircle2, 'text-emerald-500 bg-emerald-50', t.completedAt),
    );
  } else if (isTeamLeader && meData?.role === 'TEAM_LEADER' && meData.isTeamLeader) {
    activityTitle = 'Pending Review from Your Team';
    activityItems = meData.pendingReview.map((t) =>
      toActivityItem(
        t,
        `${t.assignedUser ? `${t.assignedUser.firstName} ${t.assignedUser.lastName}` : 'A worker'} completed a follow-up with ${taskMemberName(t)}`,
        Heart,
        'text-indigo-500 bg-indigo-50',
        t.completedAt,
      ),
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Hello, ${firstName}! Here's your ministry overview.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/members/new">
              <Button variant="outline" size="sm" leftIcon={<UserPlus className="h-4 w-4" />}>
                New Member
              </Button>
            </Link>
            <Link to="/follow-ups">
              <Button variant="outline" size="sm" leftIcon={<ClipboardCheck className="h-4 w-4" />}>
                My Follow-Ups
              </Button>
            </Link>
            <Link to="/encouragements/new">
              <Button variant="primary" size="sm" leftIcon={<Heart className="h-4 w-4" />}>
                Send Encouragement
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <KPICard key={i} title="" value="" icon={Users} color="indigo" isLoading />
            ))
          : kpiCards.map((card) => <KPICard key={card.title} {...card} />)}
      </div>

      {/* Charts & Tables Row 1 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <OverdueTasksTable tasks={overdueTasks} isLoading={meQuery.isLoading} />
        <TeamCompletionChart
          title={teamCompletionTitle}
          description={teamCompletionDescription}
          data={teamCompletionData}
          isLoading={canViewAll ? pastorQuery.isLoading : meQuery.isLoading}
          emptyMessage={
            pastorData || isTeamLeader
              ? 'No team completion data available yet.'
              : 'Team completion data is only available to team leads and ministry-wide roles.'
          }
        />
      </div>

      {/* Charts & Tables Row 2 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ActivityFeed title={activityTitle} items={activityItems} isLoading={meQuery.isLoading} />
        <EscalationSummary
          items={escalationItems}
          counts={escalationCounts}
          isLoading={(canViewAll && pastorQuery.isLoading) || meQuery.isLoading}
          emptyMessage={
            isTeamLeader
              ? 'No active escalations for your team right now.'
              : pastorData
                ? 'Per-escalation detail is only shown to team leads managing the affected team.'
                : 'No escalation data available for your role.'
          }
        />
      </div>
    </div>
  );
}
