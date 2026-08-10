import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, ChevronRight, MapPin, Pencil, Send, Trash2, Users, EyeOff } from 'lucide-react';
import { format, parse } from 'date-fns';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import type { EventRecord } from '@/types/event';
import { eventsApi } from '../api/events.api';
import { EventQrShare } from '../components/EventQrShare';
import { EventRegistrationsPanel } from '../components/EventRegistrationsPanel';

function errorMessage(err: unknown, fallback: string): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}

/** Combines the calendar eventDate with the optional "HH:mm" startTime/endTime strings. */
function formatEventWhen(event: Pick<EventRecord, 'eventDate' | 'startTime' | 'endTime'>): string {
  const day = format(new Date(event.eventDate), 'MMM d, yyyy');
  if (!event.startTime) return day;
  const start = format(parse(event.startTime, 'HH:mm', new Date(event.eventDate)), 'h:mm a');
  if (!event.endTime) return `${day} · ${start}`;
  const end = format(parse(event.endTime, 'HH:mm', new Date(event.eventDate)), 'h:mm a');
  return `${day} · ${start} – ${end}`;
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const canUpdate = usePermission('events.update');
  const canDelete = usePermission('events.delete');
  const canPublish = usePermission('events.publish');
  const canViewRegistrations = usePermission('events.view_registrations');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getEvent(id!).then((res) => res.data),
    enabled: !!id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['event', id] });
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  const publishMutation = useMutation({
    mutationFn: () => eventsApi.publishEvent(id!),
    onSuccess: () => {
      toast({ title: 'Event published', description: 'The public link is now live.', variant: 'success' });
      invalidate();
    },
    onError: (err: unknown) =>
      toast({ title: 'Could not publish', description: errorMessage(err, 'Please try again.'), variant: 'error' }),
  });

  const unpublishMutation = useMutation({
    mutationFn: () => eventsApi.unpublishEvent(id!),
    onSuccess: () => {
      toast({ title: 'Event unpublished', variant: 'success' });
      invalidate();
    },
    onError: (err: unknown) =>
      toast({ title: 'Could not unpublish', description: errorMessage(err, 'Please try again.'), variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => eventsApi.deleteEvent(id!),
    onSuccess: () => {
      toast({ title: 'Event deleted', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/events');
    },
    onError: (err: unknown) =>
      toast({ title: 'Could not delete event', description: errorMessage(err, 'Please try again.'), variant: 'error' }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (isError || !event) {
    return <Alert variant="error">Could not load this event.</Alert>;
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/events" className="hover:text-indigo-600">
          Events
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">{event.name}</span>
      </nav>

      <PageHeader
        title={event.name}
        subtitle="Manage event details, publish it for sign-ups, and see who's registered"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canUpdate && (
              <Button
                variant="outline"
                leftIcon={<Pencil className="h-4 w-4" />}
                onClick={() => navigate(`/events/${id}/edit`)}
              >
                Edit
              </Button>
            )}
            {canPublish && event.status !== 'PUBLISHED' && (
              <Button
                leftIcon={<Send className="h-4 w-4" />}
                isLoading={publishMutation.isPending}
                onClick={() => publishMutation.mutate()}
              >
                Publish
              </Button>
            )}
            {canPublish && event.status === 'PUBLISHED' && (
              <Button
                variant="outline"
                leftIcon={<EyeOff className="h-4 w-4" />}
                isLoading={unpublishMutation.isPending}
                onClick={() => unpublishMutation.mutate()}
              >
                Unpublish
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                leftIcon={<Trash2 className="h-4 w-4 text-rose-500" />}
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Delete
              </Button>
            )}
          </div>
        }
      />

      {event.status === 'DRAFT' && (
        <Alert variant="info">
          This event is still a draft - the public link below will show "not found" until you publish it.
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Overview</CardTitle>
          <StatusBadge status={event.status} type="event" />
        </CardHeader>
        <CardContent className="space-y-3">
          {event.heroImageUrl && (
            <img
              src={event.heroImageUrl}
              alt={event.name}
              className="mb-2 aspect-[16/9] w-full max-w-md rounded-lg object-cover"
            />
          )}
          <p className="flex items-center gap-1.5 text-sm text-slate-600">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            {formatEventWhen(event)}
          </p>
          {event.location && (
            <p className="flex items-center gap-1.5 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400" />
              {event.location}
            </p>
          )}
          <p className="flex items-center gap-1.5 text-sm text-slate-600">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="font-medium">{event.registrationCount ?? 0}</span>
            <span className="text-slate-500">registered{event.capacity ? ` of ${event.capacity} spots` : ''}</span>
          </p>
          {event.description && (
            <div
              className="prose prose-sm max-w-none border-t border-slate-100 pt-3 text-slate-700"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          )}
        </CardContent>
      </Card>

      <EventQrShare slug={event.slug} eventName={event.name} />

      {canViewRegistrations && <EventRegistrationsPanel event={event} />}

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete event"
        message={`This will permanently delete "${event.name}" and its registration data. This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
