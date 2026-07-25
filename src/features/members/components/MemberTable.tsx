import { useNavigate } from 'react-router-dom';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Users,
} from 'lucide-react';
import type { Member } from '@/types/member';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dropdown } from '@/components/ui/Dropdown';
import type { DropdownItem } from '@/components/ui/Dropdown';
import { formatDate, formatPhone, formatMemberName } from '@/lib/formatters';
import { MEMBER_STATUS } from '@/lib/constants';
import { cn } from '@/lib/cn';

interface MemberTableProps {
  members: Member[];
  isLoading: boolean;
  onSort?: (field: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

function getStatusConfig(status: string) {
  return MEMBER_STATUS.find((s) => s.value === status);
}

function SortIcon({ field, sortBy, sortOrder }: { field: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }) {
  if (sortBy !== field) {
    return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
  }
  return sortOrder === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5 text-indigo-600" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
  );
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </TableCell>
      <TableCell><div className="h-4 w-36 animate-pulse rounded bg-slate-200" /></TableCell>
      <TableCell><div className="h-4 w-28 animate-pulse rounded bg-slate-200" /></TableCell>
      <TableCell><div className="h-5 w-20 animate-pulse rounded-full bg-slate-200" /></TableCell>
      <TableCell><div className="h-4 w-24 animate-pulse rounded bg-slate-200" /></TableCell>
      <TableCell><div className="h-4 w-20 animate-pulse rounded bg-slate-200" /></TableCell>
      <TableCell><div className="h-8 w-8 animate-pulse rounded bg-slate-200" /></TableCell>
    </TableRow>
  );
}

export function MemberTable({
  members,
  isLoading,
  onSort,
  sortBy,
  sortOrder,
}: MemberTableProps) {
  const navigate = useNavigate();

  const sortableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'memberStatus', label: 'Status' },
    { key: 'joinDate', label: 'Join Date' },
    { key: 'department', label: 'Team' },
  ];

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {sortableColumns.map((col) => (
              <TableHead key={col.key}>{col.label}</TableHead>
            ))}
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonRow key={i} />
          ))}
        </TableBody>
      </Table>
    );
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="No members found"
        description="Try adjusting your search or filters to find what you are looking for."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {sortableColumns.map((col) => (
            <TableHead
              key={col.key}
              className={cn(onSort && 'cursor-pointer select-none')}
              onClick={() => onSort?.(col.key)}
            >
              <span className="inline-flex items-center gap-1.5">
                {col.label}
                {onSort && (
                  <SortIcon field={col.key} sortBy={sortBy} sortOrder={sortOrder} />
                )}
              </span>
            </TableHead>
          ))}
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const statusConfig = getStatusConfig(member.memberStatus);
          const fullName = formatMemberName(member);
          const showPreferred =
            member.preferredName &&
            member.preferredName !== member.firstName;

          const actions: DropdownItem[] = [
            {
              label: 'View profile',
              icon: <Eye />,
              onClick: () => navigate(`/members/${member.id}`),
            },
            {
              label: 'Edit',
              icon: <Pencil />,
              onClick: () => navigate(`/members/${member.id}/edit`),
            },
            { divider: true, label: '' },
            {
              label: 'Delete',
              icon: <Trash2 />,
              danger: true,
              onClick: () => {
                console.log('Delete member:', member.id);
              },
            },
          ];

          return (
            <TableRow
              key={member.id}
              className="cursor-pointer"
              onClick={() => navigate(`/members/${member.id}`)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar
                    src={member.photoUrl ?? undefined}
                    name={`${member.firstName} ${member.lastName}`}
                    size="md"
                  />
                  <div>
                    <p className="font-medium text-slate-900">{fullName}</p>
                    {showPreferred && (
                      <p className="text-xs text-slate-500">
                        ({member.preferredName})
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>{member.email ?? '--'}</TableCell>
              <TableCell>
                {member.phone ? formatPhone(member.phone) : '--'}
              </TableCell>
              <TableCell>
                <StatusBadge
                  label={statusConfig?.label ?? member.memberStatus}
                  color={statusConfig?.color}
                />
              </TableCell>
              <TableCell>
                {member.joinDate ? formatDate(member.joinDate) : '--'}
              </TableCell>
              <TableCell>{member.department ?? '--'}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
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
