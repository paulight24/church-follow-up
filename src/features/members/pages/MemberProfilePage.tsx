import { Link, useParams } from 'react-router-dom';
import {
  Pencil,
  Phone,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import type { Member } from '@/types/member';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { MemberProfileTabs } from '@/features/members/components/MemberProfileTabs';
import { formatDate, formatMemberName } from '@/lib/formatters';
import { MEMBER_STATUS } from '@/lib/constants';

const MOCK_MEMBER: Member = {
  id: '1',
  firstName: 'Adebayo',
  lastName: 'Ogunlade',
  preferredName: 'Bayo',
  email: 'adebayo.ogunlade@email.com',
  phone: '08012345678',
  secondaryPhone: '08098765432',
  gender: 'Male',
  dateOfBirth: '1985-03-15',
  address: '12 Victoria Island Drive',
  city: 'Lagos',
  state: 'Lagos',
  zipCode: '101001',
  country: 'Nigeria',
  memberStatus: 'ACTIVE',
  joinDate: '2022-01-10',
  baptismDate: '2022-06-15',
  salvationDate: '2021-12-25',
  department: 'Choir',
  occupation: 'Software Engineer',
  employer: 'TechCo Nigeria',
  notes: 'Very committed member. Interested in leadership development programs.',
  photoUrl: null,
  isActive: true,
  householdId: null,
  createdAt: '2022-01-10T08:00:00Z',
  updatedAt: '2026-07-01T12:00:00Z',
};

export function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();

  // In production, this would fetch from API using the id
  const member = MOCK_MEMBER;
  const statusConfig = MEMBER_STATUS.find(
    (s) => s.value === member.memberStatus,
  );
  const fullName = formatMemberName(member);
  const showPreferred =
    member.preferredName && member.preferredName !== member.firstName;

  if (!id) {
    return (
      <EmptyState
        title="Member not found"
        description="The member you are looking for does not exist."
      />
    );
  }

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
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Pencil className="h-4 w-4" />}
              >
                Edit
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Phone className="h-4 w-4" />}
            >
              Follow Up
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<AlertTriangle className="h-4 w-4" />}
            >
              Escalate
            </Button>
          </div>
        }
      />

      {/* Profile Header Card */}
      <Card>
        <CardContent>
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Avatar
              src={member.photoUrl ?? undefined}
              name={`${member.firstName} ${member.lastName}`}
              size="xl"
            />
            <div className="flex-1 space-y-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {member.firstName} {member.lastName}
                </h2>
                {showPreferred && (
                  <p className="text-sm text-slate-500">
                    Preferred name: {member.preferredName}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge
                  label={statusConfig?.label ?? member.memberStatus}
                  color={statusConfig?.color}
                />
                {member.joinDate && (
                  <span className="text-sm text-slate-500">
                    Member since {formatDate(member.joinDate)}
                  </span>
                )}
                {member.department && (
                  <span className="text-sm text-slate-500">
                    {member.department}
                  </span>
                )}
              </div>
              {member.occupation && (
                <p className="text-sm text-slate-500">
                  {member.occupation}
                  {member.employer ? ` at ${member.employer}` : ''}
                </p>
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
