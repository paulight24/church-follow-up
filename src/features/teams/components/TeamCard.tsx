import { useNavigate } from 'react-router-dom';
import { Users, ClipboardList } from 'lucide-react';
import type { Team } from '@/types/team';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  const navigate = useNavigate();
  const isActive = team.status === 'ACTIVE';

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
              <h3 className="truncate text-base font-semibold text-slate-900">{team.name}</h3>
              {team.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{team.description}</p>
              )}
            </div>
            <Badge variant={isActive ? 'success' : 'gray'} size="sm" dot>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">
                <span className="font-medium">{team._count?.teamUsers ?? 0}</span>{' '}
                {team._count?.teamUsers === 1 ? 'worker' : 'workers'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">
                <span className="font-medium">{team._count?.memberAssignments ?? 0}</span> assigned
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
