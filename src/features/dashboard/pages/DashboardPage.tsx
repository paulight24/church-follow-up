import { Link } from 'react-router-dom';
import {
  Users,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  UsersRound,
  UserPlus,
  MessageSquare,
  Heart,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { KPICard } from '../components/KPICard';
import { OverdueTasksTable } from '../components/OverdueTasksTable';
import { TeamCompletionChart } from '../components/TeamCompletionChart';
import { ActivityFeed } from '../components/ActivityFeed';
import { EscalationSummary } from '../components/EscalationSummary';

export function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.firstName ?? 'there';

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
            <Link to="/follow-ups/new">
              <Button variant="outline" size="sm" leftIcon={<ClipboardCheck className="h-4 w-4" />}>
                Quick Follow-Up
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
        <KPICard
          title="Total Members"
          value="1,247"
          change={12}
          changeLabel="this week"
          icon={Users}
          color="indigo"
        />
        <KPICard
          title="Open Tasks"
          value={48}
          change={-5}
          changeLabel="from last week"
          icon={ClipboardCheck}
          color="sky"
        />
        <KPICard
          title="Overdue Tasks"
          value={12}
          change={3}
          changeLabel="from last week"
          icon={AlertTriangle}
          color="rose"
        />
        <KPICard
          title="Completed This Week"
          value={36}
          change={8}
          changeLabel="vs last week"
          icon={CheckCircle2}
          color="emerald"
        />
        <KPICard
          title="Active Escalations"
          value={5}
          change={-2}
          changeLabel="from last week"
          icon={ShieldAlert}
          color="amber"
        />
        <KPICard
          title="Active Teams"
          value={8}
          change={1}
          changeLabel="this month"
          icon={UsersRound}
          color="purple"
        />
      </div>

      {/* Charts & Tables Row 1 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <OverdueTasksTable />
        <TeamCompletionChart />
      </div>

      {/* Charts & Tables Row 2 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ActivityFeed />
        <EscalationSummary />
      </div>
    </div>
  );
}
