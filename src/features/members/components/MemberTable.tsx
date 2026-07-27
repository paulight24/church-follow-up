import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Archive, MoreHorizontal, Users, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
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
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dropdown } from '@/components/ui/Dropdown';
import type { DropdownItem } from '@/components/ui/Dropdown';
import { formatDate, formatPhone, formatMemberName } from '@/lib/formatters';
import { cn } from '@/lib/cn';

interface MemberTableProps {
  members: Member[];
  isLoading: boolean;
  onArchive?: (member: Member) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
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

const sortableColumns = [
  { label: 'Name', field: 'lastName' },
  { label: 'Email', field: 'email' },
  { label: 'Phone', field: 'phonePrimary' },
  { label: 'Status', field: undefined },
  { label: 'Department', field: undefined },
  { label: 'Created', field: 'createdAt' },
] as const;

function SortIcon({ field, sortBy, sortOrder }: { field?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }) {
  if (!field) return null;
  if (field !== sortBy) return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-slate-300" />;
  return sortOrder === 'asc'
    ? <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-indigo-600" />
    : <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-indigo-600" />;
}

export function MemberTable({ members, isLoading, onArchive, sortBy, sortOrder, onSort }: MemberTableProps) {
  const navigate = useNavigate();

  const headerRow = (
    <TableRow>
      {sortableColumns.map((col) => (
        <TableHead
          key={col.label}
          className={col.field ? 'cursor-pointer select-none hover:text-slate-900' : ''}
          onClick={col.field && onSort ? () => onSort(col.field!) : undefined}
        >
          {col.label}
          <SortIcon field={col.field} sortBy={sortBy} sortOrder={sortOrder} />
        </TableHead>
      ))}
      <TableHead className="w-12" />
    </TableRow>
  );

  if (isLoading) {
    return (
      <Table>
        <TableHeader>{headerRow}</TableHeader>
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
        icon={Users}
        title="No members found"
        description="Try adjusting your search or filters to find what you are looking for."
      />
    );
  }

  return (
    <Table>
      <TableHeader>{headerRow}</TableHeader>
      <TableBody>
        {members.map((member) => {
          const fullName = formatMemberName(member);
          const showPreferred =
            member.preferredName && member.preferredName !== member.firstName;

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
            { label: '', onClick: () => {}, divider: true },
            {
              label: 'Archive',
              icon: <Archive />,
              variant: 'danger',
              onClick: () => onArchive?.(member),
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
                    src={member.profileImageUrl ?? undefined}
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
                {member.phonePrimary ? formatPhone(member.phonePrimary) : '--'}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-1.5">
                  {member.membershipStatus ? (
                    <Badge variant="default" size="sm">
                      {member.membershipStatus.name}
                    </Badge>
                  ) : (
                    <span className="text-slate-400">--</span>
                  )}
                  {member.isFirstTimer && (
                    <Badge variant="purple" size="sm">
                      First Timer
                    </Badge>
                  )}
                  {member.doNotContact && (
                    <Badge variant="danger" size="sm">
                      Do Not Contact
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{member.department?.name ?? '--'}</TableCell>
              <TableCell>{formatDate(member.createdAt)}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Dropdown
                  trigger={
                    <span
                      className={cn(
                        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600',
                      )}
                    >
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
