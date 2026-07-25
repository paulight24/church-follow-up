import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Team, TeamMember } from '@/types/team';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { TeamMemberList } from '../components/TeamMemberList';
import { AssignmentModal } from '../components/AssignmentModal';
import { formatDate, formatMemberName } from '@/lib/formatters';
import { Users, UserCheck, CheckCircle2, TrendingUp, UserPlus, ChevronRight } from 'lucide-react';

const MOCK_TEAM: Team = {
  id: '1',
  name: 'Zone A Follow-Up',
  description: 'Handles follow-up for members and visitors in Zone A (Lekki, Ajah, VI)',
  leaderId: 'l1',
  leader: { id: 'l1', firstName: 'Pastor', lastName: 'Adeyemi', email: 'adeyemi@church.org' },
  memberCount: 6,
  isActive: true,
  createdAt: '2025-11-01T08:00:00Z',
  updatedAt: '2026-07-20T09:00:00Z',
};

const MOCK_MEMBERS: TeamMember[] = [
  {
    id: 'tm1',
    teamId: '1',
    userId: 'l1',
    user: { id: 'l1', firstName: 'Pastor', lastName: 'Adeyemi', email: 'adeyemi@church.org' },
    role: 'LEADER',
    assignedCount: 15,
    completedCount: 14,
    joinedAt: '2025-11-01T08:00:00Z',
  },
  {
    id: 'tm2',
    teamId: '1',
    userId: 'u2',
    user: { id: 'u2', firstName: 'Grace', lastName: 'Adeyemi', email: 'grace.a@gmail.com' },
    role: 'MEMBER',
    assignedCount: 12,
    completedCount: 10,
    joinedAt: '2025-11-15T10:00:00Z',
  },
  {
    id: 'tm3',
    teamId: '1',
    userId: 'u3',
    user: { id: 'u3', firstName: 'Chinedu', lastName: 'Okoro', email: 'chinedu.okoro@yahoo.com' },
    role: 'MEMBER',
    assignedCount: 8,
    completedCount: 7,
    joinedAt: '2025-12-01T09:00:00Z',
  },
  {
    id: 'tm4',
    teamId: '1',
    userId: 'u4',
    user: { id: 'u4', firstName: 'Folake', lastName: 'Balogun', email: 'folake.b@hotmail.com' },
    role: 'MEMBER',
    assignedCount: 10,
    completedCount: 6,
    joinedAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'tm5',
    teamId: '1',
    userId: 'u5',
    user: { id: 'u5', firstName: 'Obinna', lastName: 'Uchenna', email: 'obinna.u@gmail.com' },
    role: 'MEMBER',
    assignedCount: 9,
    completedCount: 9,
    joinedAt: '2026-02-20T11:00:00Z',
  },
  {
    id: 'tm6',
    teamId: '1',
    userId: 'u6',
    user: { id: 'u6', firstName: 'Yetunde', lastName: 'Salami', email: 'yetunde.s@outlook.com' },
    role: 'MEMBER',
    assignedCount: 6,
    completedCount: 4,
    joinedAt: '2026-04-05T08:00:00Z',
  },
];

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // In a real app, fetch team and members based on id
  const team = MOCK_TEAM;
  const members = MOCK_MEMBERS;

  const leaderName = formatMemberName(team.leader);
  const totalAssigned = members.reduce((sum, m) => sum + m.assignedCount, 0);
  const totalCompleted = members.reduce((sum, m) => sum + m.completedCount, 0);
  const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/teams" className="hover:text-indigo-600">
          Teams
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">{team.name}</span>
      </nav>

      <PageHeader
        title={team.name}
        actions={
          <Button
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => setShowAssignmentModal(true)}
          >
            Add Member
          </Button>
        }
      />

      {/* Team Info */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              {team.description && (
                <p className="text-sm text-slate-600">{team.description}</p>
              )}
              <div className="flex items-center gap-2">
                <Avatar name={leaderName} size="sm" />
                <span className="text-sm font-medium text-slate-700">{leaderName}</span>
                <Badge variant="purple" size="sm">Leader</Badge>
              </div>
              <p className="text-xs text-slate-500">
                Created {formatDate(team.createdAt)}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 text-sm">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  team.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
              <span className={team.isActive ? 'text-emerald-700' : 'text-slate-500'}>
                {team.isActive ? 'Active' : 'Inactive'}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{members.length}</p>
              <p className="text-sm text-slate-500">Total Members</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100">
              <UserCheck className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {members.filter((m) => m.assignedCount > 0).length}
              </p>
              <p className="text-sm text-slate-500">Assigned Members</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalCompleted}</p>
              <p className="text-sm text-slate-500">Completed Tasks</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{completionRate}%</p>
              <p className="text-sm text-slate-500">Completion Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Team Members</h2>
        <Card>
          <TeamMemberList members={members} />
        </Card>
      </div>

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        teamId={id ?? ''}
      />
    </div>
  );
}
