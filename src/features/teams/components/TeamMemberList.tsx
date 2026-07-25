import { MoreHorizontal, UserMinus } from 'lucide-react';
import type { TeamMember } from '@/types/team';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Dropdown';
import type { DropdownItem } from '@/components/ui/Dropdown';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, formatMemberName } from '@/lib/formatters';
import { cn } from '@/lib/cn';

interface TeamMemberListProps {
  members: TeamMember[];
}

export function TeamMemberList({ members }: TeamMemberListProps) {
  if (members.length === 0) {
    return (
      <EmptyState
        title="No team members"
        description="This team has no members yet. Add members to get started."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Assigned</TableHead>
          <TableHead className="text-right">Completed</TableHead>
          <TableHead className="text-right">Completion %</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const name = formatMemberName(member.user);
          const completionPct =
            member.assignedCount > 0
              ? Math.round(
                  (member.completedCount / member.assignedCount) * 100,
                )
              : 0;

          const isLeader = member.role === 'LEADER';

          const actions: DropdownItem[] = [
            {
              label: 'Remove from team',
              icon: <UserMinus />,
              danger: true,
              onClick: () => {
                console.log('Remove member:', member.userId);
              },
            },
          ];

          return (
            <TableRow
              key={member.id}
              className={cn(isLeader && 'bg-indigo-50/50')}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar name={name} size="sm" />
                  <div>
                    <p className="font-medium text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500">
                      {member.user.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={isLeader ? 'purple' : 'gray'}
                  size="sm"
                >
                  {isLeader ? 'Leader' : 'Member'}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {member.assignedCount}
              </TableCell>
              <TableCell className="text-right font-medium">
                {member.completedCount}
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={cn(
                    'font-medium',
                    completionPct >= 80
                      ? 'text-emerald-600'
                      : completionPct >= 50
                        ? 'text-amber-600'
                        : 'text-slate-600',
                  )}
                >
                  {completionPct}%
                </span>
              </TableCell>
              <TableCell className="text-slate-500">
                {formatDate(member.joinedAt)}
              </TableCell>
              <TableCell>
                <Dropdown
                  trigger={
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </span>
                  }
                  items={actions}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
