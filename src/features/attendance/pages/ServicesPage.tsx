import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Plus, Users } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';
import type { ServiceType } from '@/types/attendance';
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
import { formatDate } from '@/lib/formatters';
import { attendanceApi } from '../api/attendance.api';

const SERVICE_TYPE_OPTIONS = (Object.keys(SERVICE_TYPE_LABELS) as ServiceType[]).map((value) => ({
  value,
  label: SERVICE_TYPE_LABELS[value],
}));

const FILTER_OPTIONS = [{ value: '', label: 'All service types' }, ...SERVICE_TYPE_OPTIONS];

export function ServicesPage() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [serviceDate, setServiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [serviceType, setServiceType] = useState<ServiceType>('SUNDAY');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['services', typeFilter],
    queryFn: () =>
      attendanceApi
        .getServices({ serviceType: typeFilter || undefined, pageSize: 100 })
        .then((res) => res.data),
  });

  const services = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      attendanceApi.createService({
        name: name.trim(),
        // Backend expects a full ISO datetime; the picker only gives a date.
        serviceDate: new Date(`${serviceDate}T00:00:00`).toISOString(),
        serviceType,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      closeModal();
    },
    onError: (error: AxiosError<ApiError>) => {
      setSubmitError(error.response?.data?.message ?? 'Could not create the service.');
    },
  });

  function closeModal() {
    setIsModalOpen(false);
    setName('');
    setServiceDate(new Date().toISOString().slice(0, 10));
    setServiceType('SUNDAY');
    setSubmitError(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services & Attendance"
        subtitle="Create a service, then check members in to record attendance"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
            New Service
          </Button>
        }
      />

      <Card>
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="w-64">
            <Select
              options={FILTER_OPTIONS}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-rose-600">Could not load services.</p>
        ) : services.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No services yet"
            description="Create a service to start recording attendance."
            action={
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
                New Service
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {services.map((service) => (
              <Link key={service.id} to={`/services/${service.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="space-y-3 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900">{service.name}</h3>
                      <Badge variant="gray" size="sm">
                        {SERVICE_TYPE_LABELS[service.serviceType] ?? service.serviceType}
                      </Badge>
                    </div>
                    <p className="flex items-center gap-1.5 text-sm text-slate-500">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(service.serviceDate)}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">{service._count?.attendanceRecords ?? 0}</span>
                      <span className="text-slate-500">checked in</span>
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="New Service">
        <div className="space-y-4">
          {submitError && <Alert variant="error">{submitError}</Alert>}

          <Input
            label="Service name"
            placeholder="e.g. Sunday Service"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Date"
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            required
          />
          <Select
            label="Type"
            options={SERVICE_TYPE_OPTIONS}
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ServiceType)}
          />

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={closeModal} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setSubmitError(null);
                createMutation.mutate();
              }}
              isLoading={createMutation.isPending}
              disabled={!name.trim() || !serviceDate}
            >
              Create Service
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
