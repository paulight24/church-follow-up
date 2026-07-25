import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, UserPlus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import api from '@/config/api';
import { prayerRequestsApi } from '../api/prayer-requests.api';

interface WorkerOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AssignPrayerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
}

export function AssignPrayerRequestModal({ isOpen, onClose, requestId }: AssignPrayerRequestModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ['prayer-requests', 'assignable-users'],
    queryFn: () =>
      api
        .get<{ data: WorkerOption[] }>('/users', { params: { pageSize: 100, status: 'ACTIVE' } })
        .then((res) => res.data.data ?? []),
    enabled: isOpen,
  });

  const filtered = useMemo(() => {
    const users = usersQuery.data ?? [];
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) => `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [usersQuery.data, search]);

  const assignMutation = useMutation({
    mutationFn: () => prayerRequestsApi.assignPrayerRequest(requestId!, selectedId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-requests'] });
      toast({ title: 'Prayer request assigned', variant: 'success' });
      handleClose();
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to assign';
      toast({ title: 'Error', description: message, variant: 'error' });
    },
  });

  const handleClose = () => {
    setSearch('');
    setSelectedId(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign Prayer Request"
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            leftIcon={<UserPlus className="h-4 w-4" />}
            disabled={!selectedId}
            isLoading={assignMutation.isPending}
            onClick={() => assignMutation.mutate()}
          >
            Assign
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search team members..."
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {usersQuery.isLoading ? (
            <p className="py-6 text-center text-sm text-slate-400">Loading team members...</p>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No matches found.</p>
          ) : (
            filtered.map((u) => {
              const isSelected = selectedId === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedId(u.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                    isSelected ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-50',
                  )}
                >
                  <Avatar name={`${u.firstName} ${u.lastName}`} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="truncate text-xs text-slate-500">{u.email}</p>
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
