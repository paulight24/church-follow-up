import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Upload, Users2 } from 'lucide-react';
import type { Member, MemberListFilters as MemberListFiltersType } from '@/types/member';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { MemberFilters } from '@/features/members/components/MemberFilters';
import { MemberTable } from '@/features/members/components/MemberTable';
import { membersApi } from '@/features/members/api/members.api';
import { useDebounce } from '@/hooks/useDebounce';
import type { ApiError } from '@/types';

const DEFAULT_PAGE_SIZE = 25;

export function MemberListPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<MemberListFiltersType>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [archiveTarget, setArchiveTarget] = useState<Member | null>(null);

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

  const members = data?.data ?? [];
  const totalItems = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const handleFilterChange = (newFilters: MemberListFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="Manage church members"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/members/duplicates">
              <Button variant="outline" leftIcon={<Users2 className="h-4 w-4" />}>
                Duplicates
              </Button>
            </Link>
            <Link to="/members/import">
              <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />}>
                Import
              </Button>
            </Link>
            <Link to="/members/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>Add Member</Button>
            </Link>
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
    </div>
  );
}
