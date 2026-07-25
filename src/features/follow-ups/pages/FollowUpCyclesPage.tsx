import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AxiosError } from 'axios';
import { Plus, PlayCircle, CheckCircle2 } from 'lucide-react';
import type { FollowUpCycle } from '@/types/followUp';
import type { ApiError } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { formatDate } from '@/lib/formatters';
import { usePermission } from '@/hooks/usePermission';
import { followUpCyclesApi } from '../api/follow-up-cycles.api';

const statusVariantMap: Record<FollowUpCycle['status'], 'success' | 'info' | 'warning'> = {
  ACTIVE: 'success',
  CLOSED: 'info',
  DRAFT: 'warning',
};

const statusLabelMap: Record<FollowUpCycle['status'], string> = {
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  DRAFT: 'Draft',
};

const createCycleSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(200),
    weekStartDate: z.string().min(1, 'Start date is required'),
    weekEndDate: z.string().min(1, 'End date is required'),
  })
  .refine((data) => new Date(data.weekEndDate) >= new Date(data.weekStartDate), {
    message: 'End date must be on or after the start date',
    path: ['weekEndDate'],
  });

type CreateCycleValues = z.infer<typeof createCycleSchema>;

function getProgressPercentage(taskCount: number, completedCount: number): number {
  if (taskCount === 0) return 0;
  return Math.round((completedCount / taskCount) * 100);
}

export function FollowUpCyclesPage() {
  const canManage = usePermission('follow_ups.manage_cycles');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['follow-up-cycles'],
    queryFn: () => followUpCyclesApi.getCycles({ pageSize: 100 }).then((r) => r.data),
  });

  const cycles = data?.data ?? [];

  const { data: selectedCycle, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['follow-up-cycle', selectedCycleId],
    queryFn: () => followUpCyclesApi.getCycle(selectedCycleId!).then((r) => r.data),
    enabled: !!selectedCycleId,
  });

  const invalidateCycles = () => queryClient.invalidateQueries({ queryKey: ['follow-up-cycles'] });

  const activateMutation = useMutation({
    mutationFn: (id: string) => followUpCyclesApi.activateCycle(id),
    onSuccess: invalidateCycles,
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => followUpCyclesApi.closeCycle(id),
    onSuccess: invalidateCycles,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-Up Cycles"
        actions={
          canManage && (
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
              New Cycle
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
            Failed to load follow-up cycles. Please try again.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Week Start</TableHead>
                <TableHead>Week End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Progress</TableHead>
                {canManage && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {cycles.map((cycle) => {
                const taskCount = cycle._count?.tasks ?? 0;
                return (
                  <TableRow key={cycle.id} className="cursor-pointer" onClick={() => setSelectedCycleId(cycle.id)}>
                    <TableCell className="font-medium text-slate-900">{cycle.name}</TableCell>
                    <TableCell>{formatDate(cycle.weekStartDate)}</TableCell>
                    <TableCell>{formatDate(cycle.weekEndDate)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariantMap[cycle.status]} dot>
                        {statusLabelMap[cycle.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{taskCount}</TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500">View for details</span>
                    </TableCell>
                    {canManage && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          {cycle.status === 'DRAFT' && (
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<PlayCircle className="h-3.5 w-3.5" />}
                              isLoading={activateMutation.isPending && activateMutation.variables === cycle.id}
                              onClick={() => activateMutation.mutate(cycle.id)}
                            >
                              Activate
                            </Button>
                          )}
                          {cycle.status === 'ACTIVE' && (
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                              isLoading={closeMutation.isPending && closeMutation.variables === cycle.id}
                              onClick={() => closeMutation.mutate(cycle.id)}
                            >
                              Close
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {cycles.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">No follow-up cycles yet.</div>
          )}
        </Card>
      )}

      <CreateCycleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          invalidateCycles();
        }}
      />

      <Modal
        isOpen={!!selectedCycleId}
        onClose={() => setSelectedCycleId(null)}
        title={selectedCycle?.name ?? 'Cycle Details'}
        size="md"
      >
        {isLoadingDetail && (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )}
        {selectedCycle && !isLoadingDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Week Start</p>
                <p className="font-medium text-slate-900">{formatDate(selectedCycle.weekStartDate)}</p>
              </div>
              <div>
                <p className="text-slate-500">Week End</p>
                <p className="font-medium text-slate-900">{formatDate(selectedCycle.weekEndDate)}</p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <Badge variant={statusVariantMap[selectedCycle.status]} dot>
                  {statusLabelMap[selectedCycle.status]}
                </Badge>
              </div>
              <div>
                <p className="text-slate-500">Total Tasks</p>
                <p className="font-medium text-slate-900">{selectedCycle._count?.tasks ?? 0}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Tasks by Status</p>
              <div className="space-y-1.5">
                {Object.entries(selectedCycle.taskStatusCounts).length === 0 && (
                  <p className="text-sm text-slate-400">No tasks in this cycle yet.</p>
                )}
                {Object.entries(selectedCycle.taskStatusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{status.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

interface CreateCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateCycleModal({ isOpen, onClose, onSuccess }: CreateCycleModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCycleValues>({
    resolver: zodResolver(createCycleSchema),
    defaultValues: { name: '', weekStartDate: '', weekEndDate: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: CreateCycleValues) =>
      followUpCyclesApi.createCycle({
        name: values.name,
        weekStartDate: new Date(values.weekStartDate).toISOString(),
        weekEndDate: new Date(values.weekEndDate).toISOString(),
      }),
    onSuccess: () => {
      reset();
      onSuccess();
    },
    onError: (error: AxiosError<ApiError>) => {
      setSubmitError(error.response?.data?.message ?? 'Failed to create cycle. Please try again.');
    },
  });

  const handleClose = () => {
    reset();
    setSubmitError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Follow-Up Cycle" size="md">
      <form
        onSubmit={handleSubmit((values) => {
          setSubmitError(null);
          mutation.mutate(values);
        })}
        className="space-y-4"
      >
        {submitError && <Alert variant="error">{submitError}</Alert>}

        <Input label="Cycle Name" placeholder="e.g. Week of July 20" error={errors.name?.message} {...register('name')} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePickerField label="Week Start" name="weekStartDate" register={register} error={errors.weekStartDate?.message} />
          <DatePickerField label="Week End" name="weekEndDate" register={register} error={errors.weekEndDate?.message} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Create Cycle
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function DatePickerField({
  label,
  name,
  register,
  error,
}: {
  label: string;
  name: 'weekStartDate' | 'weekEndDate';
  register: ReturnType<typeof useForm<CreateCycleValues>>['register'];
  error?: string;
}) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type="date"
        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        {...register(name)}
      />
      {error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
