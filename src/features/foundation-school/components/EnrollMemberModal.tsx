import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, X, User } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import api from '@/config/api';
import { foundationSchoolApi } from '../api/foundation-school.api';

interface SearchMember {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phonePrimary?: string | null;
}

interface EnrollMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohortId: string;
}

export function EnrollMemberModal({ isOpen, onClose, cohortId }: EnrollMemberModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedMember, setSelectedMember] = useState<SearchMember | null>(null);
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const memberResults = useQuery({
    queryKey: ['foundation-school', 'member-search', debouncedSearch],
    queryFn: () =>
      api
        .get<{ data: SearchMember[] }>('/members', { params: { search: debouncedSearch, pageSize: 8 } })
        .then((res) => res.data.data ?? []),
    enabled: debouncedSearch.trim().length >= 2,
  });

  const resetForm = () => {
    setSelectedMember(null);
    setSearch('');
    setNotes('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const enrollMutation = useMutation({
    mutationFn: foundationSchoolApi.enrollMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foundation-school'] });
      toast({ title: 'Member enrolled', variant: 'success' });
      handleClose();
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to enroll member';
      toast({ title: 'Error', description: message, variant: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedMember) {
      setError('Please select a member to enroll.');
      return;
    }
    enrollMutation.mutate({ memberId: selectedMember.id, cohortId, notes: notes.trim() || undefined });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Enroll Member"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={enrollMutation.isPending}>
            Enroll
          </Button>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        {selectedMember ? (
          <div className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
            <div className="flex items-center gap-2 text-sm text-indigo-900">
              <User className="h-4 w-4" />
              <span className="font-medium">
                {selectedMember.firstName} {selectedMember.lastName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              className="rounded p-0.5 text-indigo-500 hover:bg-indigo-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members by name..."
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            {debouncedSearch.trim().length >= 2 && (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
                {memberResults.isLoading ? (
                  <p className="px-3 py-3 text-sm text-slate-400">Searching...</p>
                ) : (memberResults.data ?? []).length === 0 ? (
                  <p className="px-3 py-3 text-sm text-slate-400">No members found.</p>
                ) : (
                  (memberResults.data ?? []).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMember(m)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-800">
                        {m.firstName} {m.lastName}
                      </span>
                      <span className="text-xs text-slate-400">{m.phonePrimary ?? m.email ?? ''}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </>
        )}

        <Textarea
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </form>
    </Modal>
  );
}
