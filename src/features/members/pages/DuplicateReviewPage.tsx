import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Merge, XCircle } from 'lucide-react';
import type { DuplicateCandidate, DuplicateGroup } from '@/types/member';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { membersApi } from '@/features/members/api/members.api';
import { formatDate, formatPhone, formatMemberName } from '@/lib/formatters';
import { cn } from '@/lib/cn';
import type { ApiError } from '@/types';

function groupKey(group: DuplicateGroup): string {
  return `${group.matchType}:${group.matchValue}`;
}

function matchBadge(matchType: DuplicateGroup['matchType']) {
  switch (matchType) {
    case 'PHONE':
      return { variant: 'danger' as const, label: 'Matching phone' };
    case 'EMAIL':
      return { variant: 'warning' as const, label: 'Matching email' };
    default:
      return { variant: 'info' as const, label: 'Matching name & DOB' };
  }
}

interface MemberComparisonProps {
  member: DuplicateCandidate;
  isSelected: boolean;
  onSelect: () => void;
}

function MemberComparison({ member, isSelected, onSelect }: MemberComparisonProps) {
  return (
    <div
      className={cn(
        'flex-1 cursor-pointer rounded-lg border-2 p-4 transition-colors',
        isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300',
      )}
      onClick={onSelect}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Added {formatDate(member.createdAt)}
        </span>
        {isSelected && (
          <Badge variant="default" size="sm">
            Keep
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Avatar name={`${member.firstName} ${member.lastName}`} size="md" />
        <div>
          <p className="font-medium text-slate-900">{formatMemberName(member)}</p>
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Email</dt>
          <dd className="font-medium text-slate-700">{member.email ?? '--'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Phone</dt>
          <dd className="font-medium text-slate-700">
            {member.phonePrimary ? formatPhone(member.phonePrimary) : '--'}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">DOB</dt>
          <dd className="font-medium text-slate-700">
            {member.dateOfBirth ? formatDate(member.dateOfBirth) : '--'}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function DuplicateReviewPage() {
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [selectedKeep, setSelectedKeep] = useState<Record<string, string>>({});
  const [mergingGroup, setMergingGroup] = useState<string | null>(null);
  const [mergeError, setMergeError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['members', 'possible-duplicates'],
    queryFn: () => membersApi.getPossibleDuplicates().then((res) => res.data),
  });

  const mergeMutation = useMutation({
    mutationFn: ({ primaryMemberId, duplicateMemberId }: { primaryMemberId: string; duplicateMemberId: string }) =>
      membersApi.mergeMembers(primaryMemberId, duplicateMemberId),
  });

  const groups = useMemo(
    () => (data ?? []).filter((group) => !dismissed.has(groupKey(group))),
    [data, dismissed],
  );

  const handleDismiss = (key: string) => {
    setDismissed((prev) => new Set(prev).add(key));
  };

  const handleMerge = async (group: DuplicateGroup) => {
    const key = groupKey(group);
    const keepId = selectedKeep[key];
    if (!keepId) return;

    setMergeError(null);
    setMergingGroup(key);
    try {
      const others = group.members.filter((m) => m.id !== keepId);
      for (const other of others) {
        await mergeMutation.mutateAsync({ primaryMemberId: keepId, duplicateMemberId: other.id });
      }
      handleDismiss(key);
      queryClient.invalidateQueries({ queryKey: ['members'] });
    } catch (err) {
      const message =
        (err as { response?: { data?: ApiError } })?.response?.data?.message ?? 'Failed to merge records.';
      setMergeError(message);
    } finally {
      setMergingGroup(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/members" className="hover:text-indigo-600">
          Members
        </Link>
        <span className="font-medium text-slate-900">/ Duplicates</span>
      </nav>

      <PageHeader
        title="Duplicate Review"
        description={
          isLoading
            ? 'Scanning for potential duplicates...'
            : `${groups.length} potential duplicate group${groups.length !== 1 ? 's' : ''} found`
        }
      />

      {isError && (
        <Alert variant="error" title="Failed to load duplicates">
          {(error as { response?: { data?: ApiError } })?.response?.data?.message ?? 'Please try again.'}
        </Alert>
      )}

      {mergeError && (
        <Alert variant="error" title="Merge failed">
          {mergeError}
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Users}
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
          {groups.map((group) => {
            const key = groupKey(group);
            const badge = matchBadge(group.matchType);
            const selected = selectedKeep[key];
            const isMerging = mergingGroup === key;

            return (
              <Card key={key}>
                <CardContent>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-slate-900">Potential Duplicate</h3>
                      <Badge variant={badge.variant} size="sm">
                        {badge.label}: {group.matchValue}
                      </Badge>
                      <Badge variant="gray" size="sm">
                        {group.members.length} records
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">Click a record to select which one to keep</p>
                  </div>

                  <div className="flex flex-col gap-4 lg:flex-row">
                    {group.members.map((member) => (
                      <MemberComparison
                        key={member.id}
                        member={member}
                        isSelected={selected === member.id}
                        onSelect={() => setSelectedKeep((prev) => ({ ...prev, [key]: member.id }))}
                      />
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex w-full items-center justify-end gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<XCircle className="h-4 w-4" />}
                      onClick={() => handleDismiss(key)}
                      disabled={isMerging}
                    >
                      Not a Duplicate
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<Merge className="h-4 w-4" />}
                      disabled={!selected || isMerging}
                      isLoading={isMerging}
                      onClick={() => handleMerge(group)}
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
