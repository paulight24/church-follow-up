import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Upload, Users2, UserPlus, X } from 'lucide-react';
import type { Member, MemberListFilters as MemberListFiltersType } from '@/types/member';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/components/ui/Toast';
import { MemberFilters } from '@/features/members/components/MemberFilters';
import { MemberTable } from '@/features/members/components/MemberTable';
import { BulkInviteResultsModal } from '@/features/members/components/BulkInviteResultsModal';
import { membersApi } from '@/features/members/api/members.api';
import { invitesApi } from '@/features/members/api/invites.api';
import type { BulkInviteOutcome } from '@/features/members/api/invites.api';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermission } from '@/hooks/usePermission';
import type { ApiError } from '@/types';

const DEFAULT_PAGE_SIZE = 25;

export function MemberListPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [filters, setFilters] = useState<MemberListFiltersType>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [archiveTarget, setArchiveTarget] = useState<Member | null>(null);

  // Backend permission codes, from routes.tsx / members.routes.ts:
  // POST /members -> members.create, POST /members/import -> members.import,
  // GET /members/possible-duplicates -> members.merge_duplicates,
  // POST /users/invite(/bulk), POST /users/:id/resend-invite -> users.create.
  const canCreateMember = usePermission('members.create');
  const canImportMembers = usePermission('members.import');
  const canMergeDuplicates = usePermission('members.merge_duplicates');
  const canInvite = usePermission('users.create');
  // PATCH /members/:id -> members.update, DELETE /members/:id (archive) -> members.delete.
  const canUpdateMember = usePermission('members.update');
  const canDeleteMember = usePermission('members.delete');

  const [selectedMembers, setSelectedMembers] = useState<Map<string, Member>>(new Map());
  const [invitingMemberId, setInvitingMemberId] = useState<string | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkInviteOutcome[] | null>(null);
  const [bulkResultsLookup, setBulkResultsLookup] = useState<Map<string, Member>>(new Map());

  const debouncedSearch = useDebounce(search, 300);

  const queryFilters: MemberListFiltersType = {
    ...filters,
    search: debouncedSearch || undefined,
    page: currentPage,
    pageSize,
    sortBy,
    sortOrder,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['members', queryFilters],
    queryFn: () => membersApi.getMembers(queryFilters).then((res) => res.data),
    placeholderData: (prev) => prev,
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => membersApi.archiveMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setArchiveTarget(null);
    },
  });

  function extractErrorMessage(err: unknown, fallback: string): string {
    return (err as { response?: { data?: ApiError } })?.response?.data?.message ?? fallback;
  }

  const inviteMutation = useMutation({
    mutationFn: (member: Member) => invitesApi.inviteMember({ memberId: member.id }),
    onMutate: (member) => setInvitingMemberId(member.id),
    onSuccess: (_res, member) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({ title: `Invite sent to ${member.email}`, variant: 'success' });
    },
    onError: (err: unknown) => {
      toast({ title: 'Could not send invite', description: extractErrorMessage(err, 'Please try again.'), variant: 'error' });
    },
    onSettled: () => setInvitingMemberId(null),
  });

  const resendMutation = useMutation({
    mutationFn: (member: Member) => {
      if (!member.userAccount) {
        return Promise.reject(new Error('This member has no login to resend an invite for.'));
      }
      return invitesApi.resendInvite(member.userAccount.id);
    },
    onMutate: (member) => setInvitingMemberId(member.id),
    onSuccess: (_res, member) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast({ title: `Invite resent to ${member.email}`, variant: 'success' });
    },
    onError: (err: unknown) => {
      toast({ title: 'Could not resend invite', description: extractErrorMessage(err, 'Please try again.'), variant: 'error' });
    },
    onSettled: () => setInvitingMemberId(null),
  });

  const bulkInviteMutation = useMutation({
    mutationFn: (memberIds: string[]) => invitesApi.bulkInvite(memberIds),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setBulkResultsLookup(new Map(selectedMembers));
      setBulkResults(res.data);
      setSelectedMembers(new Map());
    },
    onError: (err: unknown) => {
      toast({
        title: 'Could not send bulk invites',
        description: extractErrorMessage(err, 'Please try again.'),
        variant: 'error',
      });
    },
  });

  const members = data?.data ?? [];
  const totalItems = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const handleFilterChange = (newFilters: MemberListFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  function toggleSelect(memberId: string) {
    setSelectedMembers((prev) => {
      const next = new Map(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        const member = members.find((m) => m.id === memberId);
        if (member) next.set(memberId, member);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedMembers((prev) => {
      const allSelected = members.length > 0 && members.every((m) => prev.has(m.id));
      const next = new Map(prev);
      for (const m of members) {
        if (allSelected) {
          next.delete(m.id);
        } else {
          next.set(m.id, m);
        }
      }
      return next;
    });
  }

  const selectedCount = selectedMembers.size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="Manage church members"
        actions={
          <div className="flex items-center gap-2">
            {canMergeDuplicates && (
              <Link to="/members/duplicates">
                <Button variant="outline" leftIcon={<Users2 className="h-4 w-4" />}>
                  Duplicates
                </Button>
              </Link>
            )}
            {canImportMembers && (
              <Link to="/members/import">
                <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />}>
                  Import
                </Button>
              </Link>
            )}
            {canCreateMember && (
              <Link to="/members/new">
                <Button leftIcon={<Plus className="h-4 w-4" />}>Add Member</Button>
              </Link>
            )}
          </div>
        }
      />

      {isError && (
        <Alert variant="error" title="Failed to load members">
          {(error as { response?: { data?: ApiError } })?.response?.data?.message ?? 'Please try again.'}
        </Alert>
      )}

      {archiveMutation.isError && (
        <Alert variant="error" title="Failed to archive member">
          {(archiveMutation.error as { response?: { data?: ApiError } })?.response?.data?.message ??
            'Please try again.'}
        </Alert>
      )}

      <Card>
        <div className="space-y-4 p-4 sm:p-6">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, or phone..."
            className="max-w-md"
          />

          <MemberFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {canInvite && selectedCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-indigo-100 bg-indigo-50 px-4 py-3 sm:px-6">
            <p className="text-sm font-medium text-indigo-900">
              {selectedCount} member{selectedCount !== 1 ? 's' : ''} selected
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<X className="h-4 w-4" />}
                onClick={() => setSelectedMembers(new Map())}
              >
                Clear
              </Button>
              <Button
                size="sm"
                leftIcon={<UserPlus className="h-4 w-4" />}
                isLoading={bulkInviteMutation.isPending}
                onClick={() => bulkInviteMutation.mutate(Array.from(selectedMembers.keys()))}
              >
                Invite selected
              </Button>
            </div>
          </div>
        )}

        <MemberTable
          members={members}
          isLoading={isLoading}
          onArchive={(member) => setArchiveTarget(member)}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(field) => {
            if (field === sortBy) {
              setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            } else {
              setSortBy(field);
              setSortOrder('asc');
            }
            setCurrentPage(1);
          }}
          canInvite={canInvite}
          selectedIds={new Set(selectedMembers.keys())}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onInvite={(member) => inviteMutation.mutate(member)}
          onResendInvite={(member) => resendMutation.mutate(member)}
          invitingMemberId={invitingMemberId}
          canUpdate={canUpdateMember}
          canDelete={canDeleteMember}
        />

        {totalItems > 0 && (
          <div className="border-t border-slate-100 px-4 py-4 sm:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </Card>

      {archiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <Card className="w-full max-w-sm">
            <div className="space-y-4 p-6">
              <h3 className="text-base font-semibold text-slate-900">Archive member?</h3>
              <p className="text-sm text-slate-600">
                {archiveTarget.firstName} {archiveTarget.lastName} will be archived and hidden from
                the default member list. This can be undone later.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={() => setArchiveTarget(null)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={archiveMutation.isPending}
                  onClick={() => archiveMutation.mutate(archiveTarget.id)}
                >
                  Archive
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {bulkResults && (
        <BulkInviteResultsModal
          isOpen
          onClose={() => setBulkResults(null)}
          results={bulkResults}
          memberLookup={bulkResultsLookup}
        />
      )}
    </div>
  );
}
