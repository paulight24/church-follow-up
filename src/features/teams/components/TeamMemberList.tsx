import { MoreHorizontal, UserMinus } from 'lucide-react';
import type { TeamUser } from '@/types/team';
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
import { Users } from 'lucide-react';
import { formatDate, formatMemberName } from '@/lib/formatters';
import { cn } from '@/lib/cn';

interface TeamMemberListProps {
  members: TeamUser[];
  onRemove?: (member: TeamUser) => void;
}

const roleVariant: Record<TeamUser['teamRole'], 'purple' | 'info' | 'gray'> = {
  LEADER: 'purple',
  WORKER: 'info',
  BACKUP: 'gray',
};

export function TeamMemberList({ members, onRemove }: TeamMemberListProps) {
  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No team workers"
        description="This team has no workers yet. Add workers to get started."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Since</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const name = formatMemberName(member.user);
          const isLeader = member.teamRole === 'LEADER';

          const actions: DropdownItem[] = [
            {
              label: 'Remove from team',
              icon: <UserMinus />,
              variant: 'danger',
              onClick: () => onRemove?.(member),
            },
          ];

          return (
            <TableRow key={member.id} className={cn(isLeader && 'bg-indigo-50/50')}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar name={name} size="sm" />
                  <div>
                    <p className="font-medium text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500">{member.user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Badge variant={roleVariant[member.teamRole]} size="sm">
                    {member.teamRole}
                  </Badge>
                  {member.isPrimaryLeader && (
                    <Badge variant="success" size="sm">
                      Primary
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-slate-500">{formatDate(member.startsAt)}</TableCell>
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
