import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { SearchInput } from '@/components/ui/SearchInput';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
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

// ---------- Types ----------

interface CardTemplate {
  id: string;
  title: string;
  scripture: string | null;
  encouragementText: string;
  pastorSignature: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface TemplateFormData {
  title: string;
  scripture: string;
  encouragementText: string;
  pastorSignature: string;
  status: string;
}

// ---------- Constants ----------

const PAGE_SIZE = 10;

const statusFilterOptions = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const statusFormOptions = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const statusBadgeVariant: Record<string, 'success' | 'gray' | 'warning'> = {
  ACTIVE: 'success',
  DRAFT: 'gray',
  ARCHIVED: 'warning',
};

const emptyForm: TemplateFormData = {
  title: '',
  scripture: '',
  encouragementText: '',
  pastorSignature: 'Pastor Chris Oyakhilome',
  status: 'DRAFT',
};

// ---------- API helpers ----------

function fetchTemplates(params: { status?: string; search?: string; page: number; pageSize: number }) {
  return api
    .get('/encouragement-cards/templates', { params })
    .then((res) => res.data);
}

function createTemplate(data: TemplateFormData) {
  return api.post('/encouragement-cards/templates', data);
}

function updateTemplate(id: string, data: TemplateFormData) {
  return api.patch(`/encouragement-cards/templates/${id}`, data);
}

function deleteTemplate(id: string) {
  return api.delete(`/encouragement-cards/templates/${id}`);
}

// ---------- Component ----------

export function CardTemplateManagePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // The route only requires encouragement_cards.edit to reach this page;
  // creating a new template needs encouragement_cards.create on top of that.
  const canCreate = usePermission('encouragement_cards.create');

  // List state
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CardTemplate | null>(null);
  const [form, setForm] = useState<TemplateFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TemplateFormData, string>>>({});

  // Delete confirmation state
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // ---------- Queries ----------

  const { data, isLoading, isError } = useQuery({
    queryKey: ['card-templates', { status: statusFilter, search: debouncedSearch, page }],
    queryFn: () =>
      fetchTemplates({
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
  });

  const templates: CardTemplate[] = Array.isArray(data) ? data : (data?.data ?? []);
  const meta = Array.isArray(data) ? null : data?.meta;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['card-templates'] });

  // ---------- Mutations ----------

  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      toast({ title: 'Template created', variant: 'success' });
      invalidate();
      closeModal();
    },
    onError: (error: any) =>
      toast({ title: 'Could not create template', description: error?.response?.data?.message, variant: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TemplateFormData }) => updateTemplate(id, data),
    onSuccess: () => {
      toast({ title: 'Template updated', variant: 'success' });
      invalidate();
      closeModal();
    },
    onError: (error: any) =>
      toast({ title: 'Could not update template', description: error?.response?.data?.message, variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      toast({ title: 'Template deleted', variant: 'success' });
      invalidate();
    },
    onError: (error: any) =>
      toast({ title: 'Could not delete template', description: error?.response?.data?.message, variant: 'error' }),
  });

  // ---------- Modal helpers ----------

  function openCreateModal() {
    setEditingTemplate(null);
    setForm(emptyForm);
    setFormErrors({});
    setIsModalOpen(true);
  }

  function openEditModal(template: CardTemplate) {
    setEditingTemplate(template);
    setForm({
      title: template.title,
      scripture: template.scripture ?? '',
      encouragementText: template.encouragementText,
      pastorSignature: template.pastorSignature ?? '',
      status: template.status,
    });
    setFormErrors({});
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setForm(emptyForm);
    setFormErrors({});
  }

  function validateForm(): boolean {
    const errors: Partial<Record<keyof TemplateFormData, string>> = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.encouragementText.trim()) errors.encouragementText = 'Encouragement text is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validateForm()) return;

    const payload: TemplateFormData = {
      ...form,
      title: form.title.trim(),
      scripture: form.scripture.trim() || '',
      encouragementText: form.encouragementText.trim(),
      pastorSignature: form.pastorSignature.trim() || '',
    };

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function updateField<K extends keyof TemplateFormData>(field: K, value: TemplateFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ---------- Render ----------

  return (
    <div className="space-y-6">
      <PageHeader
        title="Card Templates"
        description="Manage encouragement card templates for printing and distribution"
        actions={
          canCreate ? (
            <Button onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
              New Template
            </Button>
          ) : undefined
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-6">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search templates..."
            className="sm:max-w-xs"
          />
          <div className="w-56">
            <Select
              options={statusFilterOptions}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-rose-600">Could not load templates.</p>
        ) : templates.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No templates yet"
            description={
              canCreate
                ? 'Create your first encouragement card template.'
                : 'No card templates have been created yet. Ask a Communications Manager or Administrator to create one.'
            }
            action={
              canCreate ? (
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
                  New Template
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Scripture</TableHead>
                  <TableHead>Encouragement Text</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <span className="font-medium text-slate-900">{template.title}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-600">{template.scripture ?? '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="max-w-xs truncate text-slate-600 block">
                        {template.encouragementText}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant[template.status] ?? 'gray'} dot>
                        {template.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Pencil className="h-3.5 w-3.5" />}
                          onClick={() => openEditModal(template)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                          onClick={() => setPendingDeleteId(template.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {meta && meta.totalPages > 1 && (
              <div className="border-t border-slate-100 px-4 py-4 sm:px-6">
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={setPage}
                  totalItems={meta.total}
                  pageSize={meta.limit}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTemplate ? 'Edit Template' : 'New Template'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isSaving}>
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Sunday Welcome Card"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            error={formErrors.title}
            required
          />

          <Input
            label="Scripture Reference"
            placeholder="e.g. Philippians 4:13"
            value={form.scripture}
            onChange={(e) => updateField('scripture', e.target.value)}
            helpText="Optional scripture reference to include on the card"
          />

          <Textarea
            label="Encouragement Text"
            placeholder="Write the encouragement message for the card..."
            value={form.encouragementText}
            onChange={(e) => updateField('encouragementText', e.target.value)}
            error={formErrors.encouragementText}
            rows={4}
            maxLength={500}
            required
          />

          <Input
            label="Pastor Signature"
            placeholder="e.g. Pastor Chris Oyakhilome"
            value={form.pastorSignature}
            onChange={(e) => updateField('pastorSignature', e.target.value)}
            helpText="Optional signature line for the card"
          />

          <Select
            label="Status"
            options={statusFormOptions}
            value={form.status}
            onChange={(e) => updateField('status', e.target.value)}
          />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => pendingDeleteId && deleteMutation.mutate(pendingDeleteId)}
        title="Delete template"
        message="This will permanently delete this card template. This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
