import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Users, Merge, XCircle } from 'lucide-react';
import type { Member } from '@/types/member';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, formatPhone, formatMemberName } from '@/lib/formatters';
import { MEMBER_STATUS } from '@/lib/constants';
import { cn } from '@/lib/cn';

interface DuplicatePair {
  id: string;
  member1: Member;
  member2: Member;
  confidence: number;
}

const MOCK_DUPLICATES: DuplicatePair[] = [
  {
    id: 'dup-1',
    confidence: 92,
    member1: {
      id: '101',
      firstName: 'Adebayo',
      lastName: 'Ogunlade',
      preferredName: 'Bayo',
      email: 'adebayo.ogunlade@email.com',
      phone: '08012345678',
      gender: 'Male',
      dateOfBirth: '1985-03-15',
      memberStatus: 'ACTIVE',
      joinDate: '2022-01-10',
      department: 'Choir',
      isActive: true,
      address: '12 Victoria Island Drive',
      city: 'Lagos',
      state: 'Lagos',
      zipCode: '101001',
      createdAt: '2022-01-10T08:00:00Z',
      updatedAt: '2026-07-01T12:00:00Z',
    },
    member2: {
      id: '102',
      firstName: 'Adebayo',
      lastName: 'Ogunlade',
      preferredName: null,
      email: 'bayo.ogunlade@gmail.com',
      phone: '08012345678',
      gender: 'Male',
      dateOfBirth: '1985-03-15',
      memberStatus: 'FIRST_TIMER',
      joinDate: '2026-07-14',
      department: null,
      isActive: true,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      createdAt: '2026-07-14T08:00:00Z',
      updatedAt: '2026-07-14T08:00:00Z',
    },
  },
  {
    id: 'dup-2',
    confidence: 78,
    member1: {
      id: '201',
      firstName: 'Chidinma',
      lastName: 'Okonkwo',
      preferredName: null,
      email: 'chidinma.okonkwo@email.com',
      phone: '08023456789',
      gender: 'Female',
      dateOfBirth: '1990-07-22',
      memberStatus: 'REGULAR',
      joinDate: '2020-03-08',
      department: 'Ushering',
      isActive: true,
      address: '5 Enugu Road',
      city: 'Enugu',
      state: 'Enugu',
      zipCode: '400001',
      createdAt: '2020-03-08T08:00:00Z',
      updatedAt: '2026-06-15T10:00:00Z',
    },
    member2: {
      id: '202',
      firstName: 'Chidinma',
      lastName: 'Okonkwo-Eze',
      preferredName: 'Chi',
      email: 'chidinma.okonkwo@email.com',
      phone: '09087654321',
      gender: 'Female',
      dateOfBirth: '1990-07-22',
      memberStatus: 'ACTIVE',
      joinDate: '2023-05-14',
      department: 'Protocol',
      isActive: true,
      address: '18 Independence Layout',
      city: 'Enugu',
      state: 'Enugu',
      zipCode: '400211',
      createdAt: '2023-05-14T08:00:00Z',
      updatedAt: '2026-07-10T14:00:00Z',
    },
  },
  {
    id: 'dup-3',
    confidence: 65,
    member1: {
      id: '301',
      firstName: 'Tunde',
      lastName: 'Afolabi',
      preferredName: null,
      email: 'tunde.afolabi@email.com',
      phone: '08090123456',
      gender: 'Male',
      dateOfBirth: '1998-01-05',
      memberStatus: 'NEW',
      joinDate: '2026-07-21',
      department: null,
      isActive: true,
      address: '19 Lekki Phase 1',
      city: 'Lagos',
      state: 'Lagos',
      zipCode: '105102',
      createdAt: '2026-07-21T08:00:00Z',
      updatedAt: '2026-07-21T08:00:00Z',
    },
    member2: {
      id: '302',
      firstName: 'Babatunde',
      lastName: 'Afolabi',
      preferredName: 'Tunde',
      email: null,
      phone: '08090123456',
      gender: 'Male',
      dateOfBirth: null,
      memberStatus: 'SECOND_TIMER',
      joinDate: '2026-06-30',
      department: null,
      isActive: true,
      address: null,
      city: 'Lagos',
      state: 'Lagos',
      zipCode: null,
      createdAt: '2026-06-30T08:00:00Z',
      updatedAt: '2026-07-07T08:00:00Z',
    },
  },
];

function getConfidenceBadge(confidence: number) {
  if (confidence >= 90) return { variant: 'danger' as const, label: 'High match' };
  if (confidence >= 70) return { variant: 'warning' as const, label: 'Medium match' };
  return { variant: 'info' as const, label: 'Low match' };
}

interface MemberComparisonProps {
  member: Member;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}

function MemberComparison({ member, label, isSelected, onSelect }: MemberComparisonProps) {
  const statusConfig = MEMBER_STATUS.find((s) => s.value === member.memberStatus);

  return (
    <div
      className={cn(
        'flex-1 cursor-pointer rounded-lg border-2 p-4 transition-colors',
        isSelected
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-slate-200 hover:border-slate-300',
      )}
      onClick={onSelect}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {isSelected && (
          <Badge variant="default" size="sm">
            Keep
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Avatar
          name={`${member.firstName} ${member.lastName}`}
          size="md"
        />
        <div>
          <p className="font-medium text-slate-900">
            {formatMemberName(member)}
          </p>
          <StatusBadge
            label={statusConfig?.label ?? member.memberStatus}
            color={statusConfig?.color}
          />
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Email</dt>
          <dd className="font-medium text-slate-700">
            {member.email ?? '--'}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Phone</dt>
          <dd className="font-medium text-slate-700">
            {member.phone ? formatPhone(member.phone) : '--'}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">DOB</dt>
          <dd className="font-medium text-slate-700">
            {member.dateOfBirth ? formatDate(member.dateOfBirth) : '--'}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Join Date</dt>
          <dd className="font-medium text-slate-700">
            {member.joinDate ? formatDate(member.joinDate) : '--'}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Department</dt>
          <dd className="font-medium text-slate-700">
            {member.department ?? '--'}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Address</dt>
          <dd className="truncate font-medium text-slate-700">
            {member.city && member.state
              ? `${member.city}, ${member.state}`
              : member.city ?? member.state ?? '--'}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function DuplicateReviewPage() {
  const [duplicates, setDuplicates] = useState(MOCK_DUPLICATES);
  const [selectedKeep, setSelectedKeep] = useState<Record<string, 'member1' | 'member2'>>({});

  const handleMerge = (pairId: string) => {
    const selection = selectedKeep[pairId];
    if (!selection) return;

    const pair = duplicates.find((d) => d.id === pairId);
    if (!pair) return;

    const keepId = selection === 'member1' ? pair.member1.id : pair.member2.id;
    const mergeId = selection === 'member1' ? pair.member2.id : pair.member1.id;

    console.log('Merging:', { keepId, mergeId });
    setDuplicates((prev) => prev.filter((d) => d.id !== pairId));
  };

  const handleDismiss = (pairId: string) => {
    console.log('Dismissed duplicate pair:', pairId);
    setDuplicates((prev) => prev.filter((d) => d.id !== pairId));
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/members" className="hover:text-indigo-600">
          Members
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">Duplicates</span>
      </nav>

      <PageHeader
        title="Duplicate Review"
        description={`${duplicates.length} potential duplicate${duplicates.length !== 1 ? 's' : ''} found`}
      />

      {duplicates.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title="No duplicates found"
              description="All member records appear to be unique. Great job keeping the database clean!"
              action={
                <Link to="/members">
                  <Button variant="outline">Back to Members</Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {duplicates.map((pair) => {
            const badge = getConfidenceBadge(pair.confidence);
            const selected = selectedKeep[pair.id];

            return (
              <Card key={pair.id}>
                <CardContent>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-slate-900">
                        Potential Duplicate
                      </h3>
                      <Badge variant={badge.variant} size="sm">
                        {pair.confidence}% - {badge.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Click a record to select which one to keep
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 lg:flex-row">
                    <MemberComparison
                      member={pair.member1}
                      label="Record A"
                      isSelected={selected === 'member1'}
                      onSelect={() =>
                        setSelectedKeep((prev) => ({
                          ...prev,
                          [pair.id]: 'member1',
                        }))
                      }
                    />
                    <MemberComparison
                      member={pair.member2}
                      label="Record B"
                      isSelected={selected === 'member2'}
                      onSelect={() =>
                        setSelectedKeep((prev) => ({
                          ...prev,
                          [pair.id]: 'member2',
                        }))
                      }
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex w-full items-center justify-end gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<XCircle className="h-4 w-4" />}
                      onClick={() => handleDismiss(pair.id)}
                    >
                      Not a Duplicate
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<Merge className="h-4 w-4" />}
                      disabled={!selected}
                      onClick={() => handleMerge(pair.id)}
                    >
                      Merge Records
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
