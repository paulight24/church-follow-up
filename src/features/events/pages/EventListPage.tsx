import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, MapPin, Plus, Sparkles, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/formatters';
import { formatEventDay } from '../lib/eventDate';
import { usePermission } from '@/hooks/usePermission';
import { eventsApi } from '../api/events.api';
import type { EventStatus } from '@/types/event';

const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
];

export function EventListPage() {
  const navigate = useNavigate();
  const canCreate = usePermission('events.create');
  const [status, setStatus] = useState<EventStatus | ''>('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', { status }],
    queryFn: () => eventsApi.getEvents({ status: status || undefined, pageSize: 100 }).then((res) => res.data),
  });

  const events = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        subtitle="Set up public sign-up pages for church events like Recreation Day"
        actions={
          canCreate ? (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/events/new')}>
              New Event
            </Button>
          ) : undefined
        }
      />

      <Card>
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="w-full sm:w-64">
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus | '')}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-rose-600">Could not load events.</p>
        ) : events.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No events yet"
            description={
              canCreate
                ? 'Create an event to get a public sign-up page and QR code for a flier.'
                : 'No events have been created yet.'
            }
            action={
              canCreate ? (
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/events/new')}>
                  New Event
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {events.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="space-y-3 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900">{event.name}</h3>
                      <StatusBadge status={event.status} type="event" />
                    </div>
                    <p className="flex items-center gap-1.5 text-sm text-slate-500">
                      <CalendarDays className="h-4 w-4" />
                      {formatEventDay(event.eventDate, 'MMM d, yyyy')}
                    </p>
                    {event.location && (
                      <p className="flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </p>
                    )}
                    <p className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">{event.registrationCount ?? 0}</span>
                      <span className="text-slate-500">
                        registered{event.capacity ? ` of ${event.capacity}` : ''}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
