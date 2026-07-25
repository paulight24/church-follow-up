import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp } from 'lucide-react';
import type { Team } from '@/types/team';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

interface TeamCardProps {
  team: Team;
  assignedCount?: number;
  completionRate?: number;
}

export function TeamCard({
  team,
  assignedCount = 0,
  completionRate = 0,
}: TeamCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => navigate(`/teams/${team.id}`)}
    >
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-slate-900">
                {team.name}
              </h3>
              {team.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {team.description}
                </p>
              )}
            </div>
            <Badge
              variant={team.isActive ? 'success' : 'gray'}
              size="sm"
              dot
            >
              {team.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Leader */}
          <div className="flex items-center gap-2.5">
            <Avatar
              name={`${team.leader.firstName} ${team.leader.lastName}`}
              size="sm"
            />
            <div>
              <p className="text-xs text-slate-500">Team Leader</p>
              <p className="text-sm font-medium text-slate-700">
                {team.leader.firstName} {team.leader.lastName}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">
                <span className="font-medium">{team.memberCount}</span>{' '}
                {team.memberCount === 1 ? 'member' : 'members'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">
                <span className="font-medium">{assignedCount}</span> assigned
              </span>
            </div>
          </div>

          {/* Completion Rate */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-slate-500">Completion rate</span>
              <span className="text-xs font-semibold text-slate-700">
                {completionRate}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
