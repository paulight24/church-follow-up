import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';
import type { UpdateEventRequest } from '@/types/event';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { EventForm } from '../components/EventForm';
import type { EventFormValues } from '../components/EventForm';
import { eventsApi } from '../api/events.api';

function toUpdateEventRequest(values: EventFormValues): UpdateEventRequest {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description,
    eventDate: new Date(`${values.eventDate}T00:00:00`).toISOString(),
    startTime: values.startTime || null,
    endTime: values.endTime || null,
    location: values.location.trim() || null,
    capacity: values.capacity ? Number(values.capacity) : null,
    registrationOpensAt: values.registrationOpensAt ? new Date(values.registrationOpensAt).toISOString() : null,
    registrationClosesAt: values.registrationClosesAt ? new Date(values.registrationClosesAt).toISOString() : null,
    heroImageAssetId: values.heroImageAsset ? values.heroImageAsset.id : null,
    fields: values.fields,
    customFields: values.customFields,
  };
}

export function EventEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getEvent(id!).then((res) => res.data),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateEventRequest) => eventsApi.updateEvent(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      navigate(`/events/${id}`);
    },
  });

  const errorMessage = (updateMutation.error as AxiosError<ApiError> | undefined)?.response?.data?.message;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/events" className="hover:text-indigo-600">
          Events
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">{event ? `Edit ${event.name}` : 'Edit Event'}</span>
      </nav>

      <PageHeader title="Edit Event" />

      {updateMutation.isError && (
        <Alert variant="error" title="Could not save changes">
          {errorMessage ?? 'Please check the form and try again.'}
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : isError || !event ? (
        <Alert variant="error">Could not load this event.</Alert>
      ) : (
        <Card>
          <CardContent>
            <EventForm
              initialValues={{
                name: event.name,
                slug: event.slug,
                description: event.description ?? '',
                heroImageAsset: event.heroImage ?? null,
                eventDate: event.eventDate,
                startTime: event.startTime ?? '',
                endTime: event.endTime ?? '',
                location: event.location ?? '',
                capacity: event.capacity != null ? String(event.capacity) : '',
                registrationOpensAt: event.registrationOpensAt ?? '',
                registrationClosesAt: event.registrationClosesAt ?? '',
                fields: event.fields,
                customFields: event.customFields ?? [],
              }}
              onSubmit={(values) => updateMutation.mutate(toUpdateEventRequest(values))}
              isSubmitting={updateMutation.isPending}
              onCancel={() => navigate(`/events/${id}`)}
              submitLabel="Save Changes"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
