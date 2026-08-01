import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, CalendarPlus, Pencil, Play, Power, Repeat, Trash2 } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';
import type { CreateServiceScheduleRequest, ServiceSchedule, ServiceType } from '@/types/attendance';
import { SERVICE_TYPE_LABELS } from '@/types/attendance';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { serviceSchedulesApi } from '../../attendance/api/serviceSchedules.api';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SERVICE_TYPE_OPTIONS = (Object.keys(SERVICE_TYPE_LABELS) as ServiceType[]).map((value) => ({
  value,
  label: SERVICE_TYPE_LABELS[value],
}));

/** One-click starting points for Paul's two standing services - the form
 * still opens fully editable, this just saves the retyping. */
const QUICK_PRESETS: Array<{ label: string; values: CreateServiceScheduleRequest }> = [
  {
    label: 'Sunday 10:30–13:00',
    values: {
      name: 'Sunday Service',
      serviceType: 'SUNDAY',
      dayOfWeek: 0,
      startTime: '10:30',
      endTime: '13:00',
      isActive: true,
      generateDaysAhead: 14,
    },
  },
  {
    label: 'Tuesday 19:45–22:00',
    values: {
      name: 'Midweek Service',
      serviceType: 'MIDWEEK',
      dayOfWeek: 2,
      startTime: '19:45',
      endTime: '22:00',
      isActive: true,
      generateDaysAhead: 14,
    },
  },
];

function formatTimeRange(schedule: Pick<ServiceSchedule, 'startTime' | 'endTime'>) {
  return `${schedule.startTime}–${schedule.endTime}`;
}

export function ServiceSchedulesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ServiceSchedule | null>(null);
  const [formPreset, setFormPreset] = useState<CreateServiceScheduleRequest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceSchedule | null>(null);
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState<string | null>(null);
  const [generateResult, setGenerateResult] = useState<string | null>(null);

  const schedulesQuery = useQuery({
    queryKey: ['admin', 'service-schedules'],
    queryFn: () => serviceSchedulesApi.getSchedules({ pageSize: 100 }).then((res) => res.data),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (schedule: ServiceSchedule) =>
      serviceSchedulesApi.updateSchedule(schedule.id, { isActive: !schedule.isActive }),
    onSuccess: (_res, schedule) => {
      toast({
        title: schedule.isActive ? 'Schedule deactivated' : 'Schedule activated',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'service-schedules'] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast({
        title: 'Could not update schedule',
        description: error.response?.data?.message,
        variant: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => serviceSchedulesApi.deleteSchedule(id),
    onSuccess: () => {
      toast({ title: 'Schedule deleted', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'service-schedules'] });
      setDeleteTarget(null);
    },
    onError: (error: AxiosError<ApiError>) => {
      // 409 = it already generated services; guide toward deactivating
      // instead rather than showing a generic failure toast.
      if (error.response?.status === 409) {
        setDeleteBlockedMessage(
          error.response.data?.message ??
            'This schedule has already generated services, so it cannot be deleted. Deactivate it instead to stop future generation without disturbing history.',
        );
        setDeleteTarget(null);
        return;
      }
      toast({
        title: 'Could not delete schedule',
        description: error.response?.data?.message,
        variant: 'error',
      });
      setDeleteTarget(null);
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => serviceSchedulesApi.generateNow(),
    onSuccess: (res) => {
      const { schedulesProcessed, servicesCreated } = res.data;
      setGenerateResult(
        `Checked ${schedulesProcessed} active schedule${schedulesProcessed === 1 ? '' : 's'} — created ${servicesCreated} new service${servicesCreated === 1 ? '' : 's'}.`,
      );
      queryClient.invalidateQueries({ queryKey: ['admin', 'service-schedules'] });
    },
    onError: (error: AxiosError<ApiError>) => {
      toast({
        title: 'Generation failed',
        description: error.response?.data?.message,
        variant: 'error',
      });
    },
  });

  const schedules = schedulesQuery.data?.data ?? [];

  function openCreate(preset?: CreateServiceScheduleRequest) {
    setEditingSchedule(null);
    setFormPreset(preset ?? null);
    setIsFormOpen(true);
  }

  function openEdit(schedule: ServiceSchedule) {
    setEditingSchedule(schedule);
    setFormPreset(null);
    setIsFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Schedules"
        subtitle="Recurring services that generate automatically — separate from the one-off &ldquo;New Service&rdquo; button on the Services page"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              leftIcon={<Play className="h-4 w-4" />}
              isLoading={generateMutation.isPending}
              onClick={() => generateMutation.mutate()}
            >
              Generate Now
            </Button>
            <Button leftIcon={<CalendarPlus className="h-4 w-4" />} onClick={() => openCreate()}>
              New Schedule
            </Button>
          </div>
        }
      />

      <Alert variant="info">
        Schedules here run automatically (nightly, or via &ldquo;Generate Now&rdquo;) to create upcoming
        <span className="mx-1 font-medium">Service</span>
        rows on the Services page. They never touch or duplicate services you create manually with that
        page&rsquo;s &ldquo;New Service&rdquo; button — the two coexist safely.
      </Alert>

      {generateResult && (
        <Alert variant="success" onDismiss={() => setGenerateResult(null)}>
          {generateResult}
        </Alert>
      )}

      {deleteBlockedMessage && (
        <Alert variant="warning" onDismiss={() => setDeleteBlockedMessage(null)}>
          {deleteBlockedMessage}
        </Alert>
      )}

      {schedules.length === 0 && !schedulesQuery.isLoading && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-center gap-3 py-4">
            <span className="text-sm text-slate-500">Quick start with Paul&rsquo;s standing services:</span>
            {QUICK_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                leftIcon={<Repeat className="h-3.5 w-3.5" />}
                onClick={() => openCreate(preset.values)}
              >
                {preset.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        {schedulesQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : schedulesQuery.isError ? (
          <EmptyState title="Failed to load schedules" description="Please try again shortly." />
        ) : schedules.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No recurring schedules yet"
            description="Create one for each standing service (e.g. Sunday mornings, Tuesday nights) and services will be generated automatically ahead of time."
            action={
              <Button leftIcon={<CalendarPlus className="h-4 w-4" />} onClick={() => openCreate()}>
                New Schedule
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Generated services</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium text-slate-900">{schedule.name}</TableCell>
                  <TableCell>{DAY_LABELS[schedule.dayOfWeek] ?? schedule.dayOfWeek}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatTimeRange(schedule)}</TableCell>
                  <TableCell>
                    <Badge variant="gray" size="sm">
                      {SERVICE_TYPE_LABELS[schedule.serviceType] ?? schedule.serviceType}
                    </Badge>
                  </TableCell>
                  <TableCell>{schedule._count?.services ?? 0}</TableCell>
                  <TableCell>
                    <Badge variant={schedule.isActive ? 'success' : 'gray'} dot size="sm">
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Pencil className="h-3.5 w-3.5" />}
                        onClick={() => openEdit(schedule)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title={schedule.isActive ? 'Deactivate' : 'Activate'}
                        isLoading={
                          toggleActiveMutation.isPending && toggleActiveMutation.variables?.id === schedule.id
                        }
                        onClick={() => toggleActiveMutation.mutate(schedule)}
                      >
                        <Power className={schedule.isActive ? 'h-4 w-4 text-amber-500' : 'h-4 w-4 text-emerald-600'} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Delete schedule"
                        onClick={() => setDeleteTarget(schedule)}
                      >
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <ScheduleFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSchedule(null);
          setFormPreset(null);
        }}
        schedule={editingSchedule}
        preset={formPreset}
      />

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete schedule"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This is only possible if it hasn't generated any services yet.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

// ─── Create / edit modal ────────────────────────────────────────────────

function ScheduleFormModal({
  isOpen,
  onClose,
  schedule,
  preset,
}: {
  isOpen: boolean;
  onClose: () => void;
  schedule: ServiceSchedule | null;
  preset: CreateServiceScheduleRequest | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = schedule !== null;

  const [name, setName] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('SUNDAY');
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [startTime, setStartTime] = useState('10:30');
  const [endTime, setEndTime] = useState('13:00');
  const [isActive, setIsActive] = useState(true);
  const [generateDaysAhead, setGenerateDaysAhead] = useState(14);
  const [formError, setFormError] = useState<string | null>(null);

  const [prevOpen, setPrevOpen] = useState(false);
  if (isOpen && !prevOpen) {
    const source = schedule ?? preset;
    setName(source?.name ?? '');
    setServiceType((source?.serviceType as ServiceType) ?? 'SUNDAY');
    setDayOfWeek(source?.dayOfWeek ?? 0);
    setStartTime(source?.startTime ?? '10:30');
    setEndTime(source?.endTime ?? '13:00');
    setIsActive(source?.isActive ?? true);
    setGenerateDaysAhead(source?.generateDaysAhead ?? 14);
    setFormError(null);
  }
  if (isOpen !== prevOpen) setPrevOpen(isOpen);

  const createMutation = useMutation({
    mutationFn: () =>
      serviceSchedulesApi.createSchedule({
        name: name.trim(),
        serviceType,
        dayOfWeek,
        startTime,
        endTime,
        isActive,
        generateDaysAhead,
      }),
    onSuccess: () => {
      toast({ title: 'Schedule created', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'service-schedules'] });
      onClose();
    },
    onError: (error: AxiosError<ApiError>) => {
      setFormError(error.response?.data?.message ?? 'Failed to create schedule.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      serviceSchedulesApi.updateSchedule(schedule!.id, {
        name: name.trim(),
        serviceType,
        dayOfWeek,
        startTime,
        endTime,
        isActive,
        generateDaysAhead,
      }),
    onSuccess: () => {
      toast({ title: 'Schedule updated', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'service-schedules'] });
      onClose();
    },
    onError: (error: AxiosError<ApiError>) => {
      setFormError(error.response?.data?.message ?? 'Failed to update schedule.');
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

  const dayOptions = DAY_LABELS.map((label, value) => ({ label, value: String(value) }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Schedule' : 'New Schedule'}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button isLoading={isPending} onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Create Schedule'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {formError && <Alert variant="error">{formError}</Alert>}

        <Input
          label="Name"
          placeholder="e.g. Sunday Service"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Day of week"
            options={dayOptions}
            value={String(dayOfWeek)}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
          />
          <Select
            label="Service type"
            options={SERVICE_TYPE_OPTIONS}
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ServiceType)}
          />
          <Input
            label="Start time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <Input
            label="End time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
          <Input
            label="Generate days ahead"
            type="number"
            min={1}
            max={365}
            helpText="How far in advance the next service is created."
            value={generateDaysAhead}
            onChange={(e) => setGenerateDaysAhead(Number(e.target.value))}
          />
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Active (generates services)
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}
