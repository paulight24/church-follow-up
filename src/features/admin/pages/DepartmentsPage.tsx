import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, RotateCcw, Building2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/Textarea';
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

interface Department {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

interface DepartmentListResponse {
  data: Department[];
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

function fetchDepartments(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}) {
  return api
    .get<DepartmentListResponse>('/departments', { params })
    .then((res) => res.data);
}

function createDepartment(body: { name: string; description: string; status: string }) {
  return api.post('/departments', body);
}

function updateDepartment(id: string, body: { name: string; description: string; status: string }) {
  return api.patch(`/departments/${id}`, body);
}

function archiveDepartment(id: string) {
  return api.delete(`/departments/${id}`);
}

function restoreDepartment(id: string) {
  return api.post(`/departments/${id}/restore`);
}

// ─── Main page ──────────────────────────────────────────────────────────

export function DepartmentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // The route only requires departments.view to reach this page; creating,
  // editing, archiving, and restoring all need departments.manage on top of that.
  const canManage = usePermission('departments.manage');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Department | null>(null);

  const departmentsQuery = useQuery({
    queryKey: ['admin', 'departments', { page, search: debouncedSearch, status }],
    queryFn: () =>
      fetchDepartments({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: status || undefined,
      }),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveDepartment(id),
    onSuccess: () => {
      toast({ title: 'Department archived', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      setArchiveTarget(null);
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      toast({ title: 'Could not archive department', description: message, variant: 'error' });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreDepartment(id),
    onSuccess: () => {
      toast({ title: 'Department restored', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      toast({ title: 'Could not restore department', description: message, variant: 'error' });
    },
  });

  const departments = departmentsQuery.data?.data ?? [];
  const meta = departmentsQuery.data?.meta;

  function openCreate() {
    setEditingDepartment(null);
    setIsFormOpen(true);
  }

  function openEdit(dept: Department) {
    setEditingDepartment(dept);
    setIsFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage church departments"
        actions={
          canManage ? (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Add Department
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
          placeholder="Search departments..."
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

      {departmentsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : departmentsQuery.isError ? (
        <EmptyState title="Failed to load departments" description="Please try again shortly." />
      ) : departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell>
                    <span className="font-medium text-slate-900">{dept.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-500">{dept.description || '--'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[dept.status] ?? 'gray'} dot size="sm">
                      {dept.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {canManage ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Pencil className="h-3.5 w-3.5" />}
                          onClick={() => openEdit(dept)}
                        >
                          Edit
                        </Button>
                        {dept.status === 'ACTIVE' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setArchiveTarget(dept)}
                            title="Archive department"
                          >
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            isLoading={restoreMutation.isPending}
                            onClick={() => restoreMutation.mutate(dept.id)}
                            title="Restore department"
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

      <DepartmentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDepartment(null);
        }}
        department={editingDepartment}
      />

      <ConfirmDialog
        isOpen={archiveTarget !== null}
        onClose={() => setArchiveTarget(null)}
        onConfirm={() => archiveTarget && archiveMutation.mutate(archiveTarget.id)}
        title="Archive department"
        message={`Are you sure you want to archive "${archiveTarget?.name}"? It can be restored later.`}
        confirmText="Archive"
        variant="danger"
      />
    </div>
  );
}

// ─── Create / Edit modal ────────────────────────────────────────────────

function DepartmentFormModal({
  isOpen,
  onClose,
  department,
}: {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEditing = department !== null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);

  // Reset form when opening
  const [prevOpen, setPrevOpen] = useState(false);
  if (isOpen && !prevOpen) {
    if (department) {
      setName(department.name);
      setDescription(department.description ?? '');
      setFormStatus(department.status);
    } else {
      setName('');
      setDescription('');
      setFormStatus('ACTIVE');
    }
    setFormError(null);
  }
  if (isOpen !== prevOpen) setPrevOpen(isOpen);

  const createMutation = useMutation({
    mutationFn: () => createDepartment({ name, description, status: formStatus }),
    onSuccess: () => {
      toast({ title: 'Department created', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      onClose();
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      setFormError(message ?? 'Failed to create department.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateDepartment(department!.id, { name, description, status: formStatus }),
    onSuccess: () => {
      toast({ title: 'Department updated', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      onClose();
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      setFormError(message ?? 'Failed to update department.');
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
      title={isEditing ? 'Edit Department' : 'Add Department'}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button isLoading={isPending} onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Create Department'}
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
          placeholder="e.g. Music Department"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this department"
          rows={3}
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
