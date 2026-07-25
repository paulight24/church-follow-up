import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Phone, AlertTriangle, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { MemberProfileTabs } from '@/features/members/components/MemberProfileTabs';
import { membersApi } from '@/features/members/api/members.api';
import { formatDate, formatMemberName } from '@/lib/formatters';
import type { ApiError } from '@/types';

export function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: member, isLoading, isError, error } = useQuery({
    queryKey: ['member', id],
    queryFn: () => membersApi.getMember(id as string).then((res) => res.data),
    enabled: !!id,
  });

  if (!id) {
    return (
      <EmptyState title="Member not found" description="The member you are looking for does not exist." />
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (isError || !member) {
    return (
      <Alert variant="error" title="Failed to load member">
        {(error as { response?: { data?: ApiError } } | undefined)?.response?.data?.message ??
          'This member could not be found.'}
      </Alert>
    );
  }

  const fullName = formatMemberName(member);
  const showPreferred = member.preferredName && member.preferredName !== member.firstName;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/members" className="hover:text-indigo-600">
          Members
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">{fullName}</span>
      </nav>

      <PageHeader
        title={fullName}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/members/${id}/edit`}>
              <Button variant="outline" size="sm" leftIcon={<Pencil className="h-4 w-4" />}>
                Edit
              </Button>
            </Link>
            <Button variant="secondary" size="sm" leftIcon={<Phone className="h-4 w-4" />}>
              Follow Up
            </Button>
            <Button variant="danger" size="sm" leftIcon={<AlertTriangle className="h-4 w-4" />}>
              Escalate
            </Button>
          </div>
        }
      />

      {member.archivedAt && (
        <Alert variant="warning" title="This member is archived">
          Archived on {formatDate(member.archivedAt)}. They are hidden from the default member list.
        </Alert>
      )}

      {/* Profile Header Card */}
      <Card>
        <CardContent>
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Avatar
              src={member.profileImageUrl ?? undefined}
              name={`${member.firstName} ${member.lastName}`}
              size="xl"
            />
            <div className="flex-1 space-y-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {member.firstName} {member.lastName}
                </h2>
                {showPreferred && (
                  <p className="text-sm text-slate-500">Preferred name: {member.preferredName}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {member.membershipStatus && <Badge variant="default">{member.membershipStatus.name}</Badge>}
                {member.isFirstTimer && <Badge variant="purple">First Timer</Badge>}
                {member.doNotContact && <Badge variant="danger">Do Not Contact</Badge>}
                {member.createdAt && (
                  <span className="text-sm text-slate-500">Added {formatDate(member.createdAt)}</span>
                )}
                {member.department && (
                  <span className="text-sm text-slate-500">{member.department.name}</span>
                )}
              </div>
              {member.fellowshipGroup && (
                <p className="text-sm text-slate-500">Fellowship group: {member.fellowshipGroup.name}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <MemberProfileTabs member={member} />
    </div>
  );
}
