import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { TeamCard } from '../components/TeamCard';
import { CreateTeamModal } from '../components/CreateTeamModal';
import { teamsApi } from '../api/teams.api';
import { useDebounce } from '@/hooks/useDebounce';
import type { ApiError } from '@/types';

export function TeamListPage() {
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['teams', { search: debouncedSearch }],
    queryFn: () =>
      teamsApi.getTeams({ search: debouncedSearch || undefined, pageSize: 50 }).then((res) => res.data),
    placeholderData: (prev) => prev,
  });

  const teams = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams"
        description="Manage follow-up teams"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
            Create Team
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search teams by name..."
        className="max-w-md"
      />

      {isError && (
        <Alert variant="error" title="Failed to load teams">
          {(error as { response?: { data?: ApiError } })?.response?.data?.message ?? 'Please try again.'}
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teams yet"
          description="Create your first follow-up team to start assigning members to workers."
          action={
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
              Create Team
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}

      <CreateTeamModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
