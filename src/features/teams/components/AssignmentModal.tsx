import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, X, UserPlus, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/cn';
import { usersLookupApi } from '@/features/teams/api/users.api';
import { teamsApi } from '@/features/teams/api/teams.api';
import type { TeamRole } from '@/types/team';
import type { ApiError } from '@/types';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  existingUserIds: string[];
}

const roleOptions = [
  { label: 'Worker', value: 'WORKER' },
  { label: 'Leader', value: 'LEADER' },
  { label: 'Backup', value: 'BACKUP' },
];

export function AssignmentModal({ isOpen, onClose, teamId, existingUserIds }: AssignmentModalProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [teamRole, setTeamRole] = useState<TeamRole>('WORKER');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', 'lookup', searchQuery],
    queryFn: () => usersLookupApi.getUsers({ search: searchQuery || undefined }).then((res) => res.data.data),
    enabled: isOpen,
  });

  const availableUsers = useMemo(
    () => (users ?? []).filter((u) => !existingUserIds.includes(u.id)),
    [users, existingUserIds],
  );

  const addMutation = useMutation({
    mutationFn: async () => {
      for (const userId of selectedIds) {
        await teamsApi.addTeamUser(teamId, { userId, teamRole });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      handleClose();
    },
  });

  const handleClose = () => {
    setSelectedIds(new Set());
    setSearchQuery('');
    setTeamRole('WORKER');
    addMutation.reset();
    onClose();
  };

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const errorMessage = (addMutation.error as { response?: { data?: ApiError } } | undefined)?.response
    ?.data?.message;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Team Worker"
      size="md"
      footer={
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {selectedIds.size} user{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={() => addMutation.mutate()}
              isLoading={addMutation.isPending}
              disabled={selectedIds.size === 0}
              leftIcon={<UserPlus className="h-4 w-4" />}
            >
              Add to Team
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {addMutation.isError && (
          <Alert variant="error" title="Failed to add worker(s)">
            {errorMessage ?? 'Please try again.'}
          </Alert>
        )}

        <div className="w-40">
          <Select label="Role" options={roleOptions} value={teamRole} onChange={(e) => setTeamRole(e.target.value as TeamRole)} />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Selected Members */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedIds).map((id) => {
              const user = availableUsers.find((u) => u.id === id);
              if (!user) return null;
              return (
                <Badge key={id} variant="default" size="md">
                  <span className="flex items-center gap-1.5">
                    {user.firstName} {user.lastName}
                    <button
                      type="button"
                      onClick={() => toggleMember(id)}
                      className="ml-0.5 rounded-full hover:bg-indigo-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                </Badge>
              );
            })}
          </div>
        )}

        {/* User List */}
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {isLoading ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading users...</p>
          ) : availableUsers.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No available users found matching your search.
            </p>
          ) : (
            availableUsers.map((user) => {
              const isSelected = selectedIds.has(user.id);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleMember(user.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                    isSelected ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-50',
                  )}
                >
                  <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-indigo-600" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
