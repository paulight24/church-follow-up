import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AxiosError } from 'axios';
import { Plus, FileText } from 'lucide-react';
import type { ApiError } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeDate } from '@/lib/formatters';
import { usePermission } from '@/hooks/usePermission';
import { callGuidesApi } from '../api/call-guides.api';
import type { CallGuideStatus } from '../types';

const statusVariantMap: Record<CallGuideStatus, 'success' | 'warning' | 'gray'> = {
  DRAFT: 'warning',
  PUBLISHED: 'success',
  ARCHIVED: 'gray',
};

const createGuideSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  reasonCode: z.string().optional(),
});

type CreateGuideValues = z.infer<typeof createGuideSchema>;

export function CallGuideListPage() {
  const navigate = useNavigate();
  const canCreate = usePermission('call_guides.create');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: guides, isLoading, isError } = useQuery({
    queryKey: ['call-guides'],
    queryFn: () => callGuidesApi.getCallGuides().then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGuideValues>({
    resolver: zodResolver(createGuideSchema),
    defaultValues: { name: '', reasonCode: '' },
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateGuideValues) =>
      callGuidesApi.createCallGuide({ name: values.name, reasonCode: values.reasonCode || undefined }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['call-guides'] });
      reset();
      setShowCreateModal(false);
      navigate(`/call-guides/${response.data.id}`);
    },
    onError: (error: AxiosError<ApiError>) => {
      setSubmitError(error.response?.data?.message ?? 'Failed to create call guide. Please try again.');
    },
  });

  const handleCloseModal = () => {
    reset();
    setSubmitError(null);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Call Guides"
        actions={
          canCreate && (
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
              Create Guide
            </Button>
          )
        }
      />

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-rose-600">
            Failed to load call guides. Please try again.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && guides && guides.length === 0 && (
        <Card>
          <EmptyState
            icon={FileText}
            title="No call guides yet"
            description="Create a call guide to give your follow-up team a consistent script to work from."
          />
        </Card>
      )}

      {!isLoading && !isError && guides && guides.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {guides.map((guide) => (
            <Card key={guide.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  <CardTitle className="text-base">{guide.name}</CardTitle>
                </div>
                <Badge variant={statusVariantMap[guide.status]}>{guide.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">
                  {guide.currentVersion?.title ?? 'No published version yet'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Updated {formatRelativeDate(guide.updatedAt)} &middot; {guide._count?.versions ?? 0} version
                    {guide._count?.versions === 1 ? '' : 's'}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/call-guides/${guide.id}`)}>
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={handleCloseModal} title="Create Call Guide" size="md">
        <form
          onSubmit={handleSubmit((values) => {
            setSubmitError(null);
            createMutation.mutate(values);
          })}
          className="space-y-4"
        >
          {submitError && <Alert variant="error">{submitError}</Alert>}

          <Input label="Guide Name" placeholder="e.g. New Visitor Follow-Up" error={errors.name?.message} {...register('name')} />
          <Input
            label="Reason Code (optional)"
            placeholder="e.g. NEW_VISITOR"
            helpText="Matches a follow-up task reason code so this guide can be auto-suggested."
            error={errors.reasonCode?.message}
            {...register('reasonCode')}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleCloseModal} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Guide
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
