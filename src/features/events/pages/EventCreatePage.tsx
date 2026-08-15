import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';
import type { CreateEventRequest } from '@/types/event';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { EventForm } from '../components/EventForm';
import type { EventFormValues } from '../components/EventForm';
import { eventsApi } from '../api/events.api';

function toCreateEventRequest(values: EventFormValues): CreateEventRequest {
  const payload: CreateEventRequest = {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description,
    // Backend stores eventDate as a full ISO datetime even though the form only collects
    // a calendar date - midnight local time, same convention ServicesPage uses for serviceDate.
    eventDate: new Date(`${values.eventDate}T00:00:00`).toISOString(),
    fields: values.fields,
    customFields: values.customFields,
  };

  if (values.startTime) payload.startTime = values.startTime;
  if (values.endTime) payload.endTime = values.endTime;
  if (values.location.trim()) payload.location = values.location.trim();
  if (values.capacity) payload.capacity = Number(values.capacity);
  if (values.registrationOpensAt) payload.registrationOpensAt = new Date(values.registrationOpensAt).toISOString();
  if (values.registrationClosesAt) payload.registrationClosesAt = new Date(values.registrationClosesAt).toISOString();
  if (values.heroImageAsset) payload.heroImageAssetId = values.heroImageAsset.id;

  return payload;
}

export function EventCreatePage() {
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: (data: CreateEventRequest) => eventsApi.createEvent(data),
    onSuccess: (res) => navigate(`/events/${res.data.id}`),
  });

  const errorMessage = (createMutation.error as AxiosError<ApiError> | undefined)?.response?.data?.message;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/events" className="hover:text-indigo-600">
          Events
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">New Event</span>
      </nav>

      <PageHeader title="New Event" subtitle="This starts as a draft - publish it once it's ready to share." />

      {createMutation.isError && (
        <Alert variant="error" title="Could not create event">
          {errorMessage ?? 'Please check the form and try again.'}
        </Alert>
      )}

      <Card>
        <CardContent>
          <EventForm
            onSubmit={(values) => createMutation.mutate(toCreateEventRequest(values))}
            isSubmitting={createMutation.isPending}
            onCancel={() => navigate('/events')}
            submitLabel="Create Event"
          />
        </CardContent>
      </Card>
    </div>
  );
}
