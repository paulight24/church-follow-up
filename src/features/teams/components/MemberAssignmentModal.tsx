import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Search, UserPlus, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/cn';
import { membersApi } from '@/features/members/api/members.api';
import { memberAssignmentsApi } from '../api/member-assignments.api';
import type { TeamUser } from '@/types/team';
import type { ApiError } from '@/types';

/**
 * Assigns CONGREGATION MEMBERS to a team's worker for follow-up.
 *
 * Deliberately distinct from AssignmentModal, which adds staff *users* to the
 * team. The two are easy to confuse and the app has both concepts for a good
 * reason: a Member is someone the church cares for, a User is someone who
 * logs in and does the caring. This modal is the bridge — it says "these
 * members are Grace's to follow up".
 *
 * Members are picked in bulk because assignment realistically happens after a
 * service, in a batch, not one person at a time.
 */
interface MemberAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  /** Team members who can be given follow-up work. */
  workers: TeamUser[];
  /** Members already assigned in this team — hidden from the picker. */
  assignedMemberIds: string[];
}

export function MemberAssignmentModal({
  isOpen,
  onClose,
  teamId,
  workers,
  assignedMemberIds,
}: MemberAssignmentModalProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [primaryWorkerUserId, setPrimaryWorkerUserId] = useState('');
  const [backupWorkerUserId, setBackupWorkerUserId] = useState('');

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', 'assignable', searchQuery],
    queryFn: () =>
      membersApi
        .getMembers({ search: searchQuery || undefined, pageSize: 25 } as never)
        .then((res) => res.data.data),
    enabled: isOpen,
  });

  const availableMembers = useMemo(
    () => (members ?? []).filter((m) => !assignedMemberIds.includes(m.id)),
    [members, assignedMemberIds]
  );

  const workerOptions = useMemo(
    () =>
      workers.map((w) => ({
        value: w.userId,
        label: `${w.user?.firstName ?? ''} ${w.user?.lastName ?? ''}`.trim() || w.userId,
      })),
    [workers]
  );

  const assignMutation = useMutation({
    mutationFn: async () => {
      // Sequential rather than Promise.all: each assignment is its own audited
      // write, and a partial failure should stop rather than fan out.
      for (const memberId of selectedIds) {
        await memberAssignmentsApi.createMemberAssignment({
          memberId,
          teamId,
          primaryWorkerUserId,
          ...(backupWorkerUserId ? { backupWorkerUserId } : {}),
        });
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      void queryClient.invalidateQueries({ queryKey: ['member-assignments'] });
      handleClose();
    },
  });

  const handleClose = () => {
    setSelectedIds(new Set());
    setSearchQuery('');
    setPrimaryWorkerUserId('');
    setBackupWorkerUserId('');
    onClose();
  };

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const errorMessage = (assignMutation.error as { response?: { data?: ApiError } } | null)?.response
    ?.data?.message;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assign members to a worker" size="lg">
      <div className="space-y-4">
        {workers.length === 0 ? (
          <Alert variant="warning">
            This team has no workers yet. Add a worker to the team first — members are assigned to a
            person, not to the team itself.
          </Alert>
        ) : (
          <>
            {assignMutation.isError && <Alert variant="error">{errorMessage ?? 'Could not assign these members.'}</Alert>}

            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Follow-up worker"
                value={primaryWorkerUserId}
                onChange={(e) => setPrimaryWorkerUserId(e.target.value)}
                options={workerOptions}
                placeholder="Choose who will follow up"
              />
              <Select
                label="Backup (optional)"
                value={backupWorkerUserId}
                onChange={(e) => setBackupWorkerUserId(e.target.value)}
                options={workerOptions.filter((o) => o.value !== primaryWorkerUserId)}
                placeholder="No backup"
              />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members by name, email or phone…"
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-1">
              {isLoading ? (
                <p className="py-8 text-center text-sm text-slate-400">Loading members…</p>
              ) : availableMembers.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  {searchQuery ? 'No members match that search.' : 'Every member found is already assigned.'}
                </p>
              ) : (
                availableMembers.map((m) => {
                  const selected = selectedIds.has(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggle(m.id)}
                      aria-pressed={selected}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                        selected ? 'bg-indigo-50' : 'hover:bg-slate-50'
                      )}
                    >
                      <Avatar name={`${m.firstName} ${m.lastName}`} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-900">
                          {m.firstName} {m.lastName}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {m.email || m.phonePrimary || 'No contact details'}
                        </span>
                      </span>
                      {selected && <Check className="h-4 w-4 shrink-0 text-indigo-600" />}
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm text-slate-500">
                {selectedIds.size} member{selectedIds.size === 1 ? '' : 's'} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" leftIcon={<X className="h-4 w-4" />} onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  leftIcon={<UserPlus className="h-4 w-4" />}
                  disabled={selectedIds.size === 0 || !primaryWorkerUserId}
                  isLoading={assignMutation.isPending}
                  onClick={() => assignMutation.mutate()}
                >
                  Assign
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
