import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, RotateCcw, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermission } from '@/hooks/usePermission';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import api from '@/config/api';

// ─── Types ──────────────────────────────────────────────────────────────

interface FellowshipGroup {
  id: string;
  name: string;
  meetingLocation: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

interface FellowshipGroupListResponse {
  data: FellowshipGroup[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

// ─── Constants ──────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

const statusOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const statusVariant: Record<string, 'success' | 'gray'> = {
  ACTIVE: 'success',
  ARCHIVED: 'gray',
};

// ─── API helpers ────────────────────────────────────────────────────────

function fetchFellowshipGroups(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}) {
  return api
    .get<FellowshipGroupListResponse>('/fellowship-groups', { params })
    .then((res) => res.data);
}

function createFellowshipGroup(body: {
  name: string;
  meetingLocation: string;
  status: string;
}) {
  return api.post('/fellowship-groups', body);
}

function updateFellowshipGroup(
  id: string,
  body: { name: string; meetingLocation: string; status: string },
) {
  return api.patch(`/fellowship-groups/${id}`, body);
}

function archiveFellowshipGroup(id: string) {
  return api.delete(`/fellowship-groups/${id}`);
}

function restoreFellowshipGroup(id: string) {
  return api.post(`/fellowship-groups/${id}/restore`);
}

// ─── Main page ──────────────────────────────────────────────────────────

export function FellowshipGroupsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // The route only requires fellowship_groups.view to reach this page;
  // creating, editing, archiving, and restoring all need fellowship_groups.manage too.
  const canManage = usePermission('fellowship_groups.manage');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FellowshipGroup | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<FellowshipGroup | null>(null);

  const groupsQuery = useQuery({
    queryKey: ['admin', 'fellowship-groups', { page, search: debouncedSearch, status }],
    queryFn: () =>
      fetchFellowshipGroups({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: status || undefined,
      }),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveFellowshipGroup(id),
    onSuccess: () => {
      toast({ title: 'Cell group archived', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'fellowship-groups'] });
      setArchiveTarget(null);
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      toast({
        title: 'Could not archive cell group',
        description: message,
        variant: 'error',
      });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreFellowshipGroup(id),
    onSuccess: () => {
      toast({ title: 'Cell group restored', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'fellowship-groups'] });
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      toast({
        title: 'Could not restore cell group',
        description: message,
        variant: 'error',
      });
    },
  });

  const groups = groupsQuery.data?.data ?? [];
  const meta = groupsQuery.data?.meta;

  function openCreate() {
    setEditingGroup(null);
    setIsFormOpen(true);
  }

  function openEdit(group: FellowshipGroup) {
    setEditingGroup(group);
    setIsFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cell Groups"
        description="Manage cell groups and their meeting locations"
        actions={
          canManage ? (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Add Cell Group
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search cell groups..."
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={statusOptions}
          className="sm:max-w-[180px]"
        />
      </div>

      {groupsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : groupsQuery.isError ? (
        <EmptyState
          title="Failed to load cell groups"
          description="Please try again shortly."
        />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No cell groups found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Meeting Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>
                    <span className="font-medium text-slate-900">{group.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-500">{group.meetingLocation || '--'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[group.status] ?? 'gray'} dot size="sm">
                      {group.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {canManage ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Pencil className="h-3.5 w-3.5" />}
                          onClick={() => openEdit(group)}
                        >
                          Edit
                        </Button>
                        {group.status === 'ACTIVE' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setArchiveTarget(group)}
                            title="Archive cell group"
                          >
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            isLoading={restoreMutation.isPending}
                            onClick={() => restoreMutation.mutate(group.id)}
                            title="Restore cell group"
                          >
                            <RotateCcw className="h-4 w-4 text-emerald-600" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {meta && meta.totalPages > 1 && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              pageSize={meta.limit}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <FellowshipGroupFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingGroup(null);
        }}
        group={editingGroup}
      />

      <ConfirmDialog
        isOpen={archiveTarget !== null}
        onClose={() => setArchiveTarget(null)}
        onConfirm={() => archiveTarget && archiveMutation.mutate(archiveTarget.id)}
        title="Archive cell group"
        message={`Are you sure you want to archive "${archiveTarget?.name}"? It can be restored later.`}
        confirmText="Archive"
        variant="danger"
      />
    </div>
  );
}

// ─── Create / Edit modal ────────────────────────────────────────────────

function FellowshipGroupFormModal({
  isOpen,
  onClose,
  group,
}: {
  isOpen: boolean;
  onClose: () => void;
  group: FellowshipGroup | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEditing = group !== null;

  const [name, setName] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);

  // Reset form when opening
  const [prevOpen, setPrevOpen] = useState(false);
  if (isOpen && !prevOpen) {
    if (group) {
      setName(group.name);
      setMeetingLocation(group.meetingLocation ?? '');
      setFormStatus(group.status);
    } else {
      setName('');
      setMeetingLocation('');
      setFormStatus('ACTIVE');
    }
    setFormError(null);
  }
  if (isOpen !== prevOpen) setPrevOpen(isOpen);

  const createMutation = useMutation({
    mutationFn: () =>
      createFellowshipGroup({ name, meetingLocation, status: formStatus }),
    onSuccess: () => {
      toast({ title: 'Fellowship group created', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'fellowship-groups'] });
      onClose();
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      setFormError(message ?? 'Failed to create cell group.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateFellowshipGroup(group!.id, { name, meetingLocation, status: formStatus }),
    onSuccess: () => {
      toast({ title: 'Fellowship group updated', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'fellowship-groups'] });
      onClose();
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      setFormError(message ?? 'Failed to update cell group.');
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleSubmit() {
    setFormError(null);
    if (!name.trim()) {
      setFormError('Name is required.');
      return;
    }
    if (isEditing) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  }

  const formStatusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Archived', value: 'ARCHIVED' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Cell Group' : 'Add Cell Group'}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button isLoading={isPending} onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Create Cell Group'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {formError && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>
        )}
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Noble Cell"
        />
        <Input
          label="Meeting Location"
          value={meetingLocation}
          onChange={(e) => setMeetingLocation(e.target.value)}
          placeholder="e.g. Church Hall B"
        />
        {isEditing && (
          <Select
            label="Status"
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value as 'ACTIVE' | 'ARCHIVED')}
            options={formStatusOptions}
          />
        )}
      </div>
    </Modal>
  );
}
