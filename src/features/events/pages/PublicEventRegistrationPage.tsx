import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { CalendarClock, CalendarX2, CheckCircle2, Frown, MapPin, PartyPopper, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import type { ApiError } from '@/types';
import type { EventRegistrationAnswers, PublicRegistrationStatus } from '@/types/event';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import { publicEventsApi } from '../api/publicEvents.api';
import { buildRegistrationSchema, defaultRegistrationValues, publicFieldsToConfig } from '../lib/eventFields';
import type { RegistrationFormValues } from '../lib/eventFields';
import { EventRegistrationFields } from '../components/EventRegistrationFields';
import { formatEventDay, formatEventWhen } from '../lib/eventDate';

/** Shared shell for every state of this page - centered, single-column, no app chrome. */
function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-6 sm:py-12">
      <div className="mx-auto w-full max-w-lg">{children}</div>
    </div>
  );
}

function CenteredMessageCard({
  icon: Icon,
  iconClassName,
  title,
  description,
}: {
  icon: typeof Frown;
  iconClassName: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-8 text-center shadow-lg sm:p-10">
      <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${iconClassName}`}>
        <Icon className="h-8 w-8" />
      </div>
      <h1 className="mb-2 text-xl font-semibold text-slate-900">{title}</h1>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

// One entry per PublicRegistrationStatus other than 'OPEN' - the backend authoritatively
// computes this (events.service.ts's computeRegistrationStatus), so the page just renders
// whichever kind message matches instead of re-deriving the reason itself.
const CLOSED_STATE_COPY: Partial<Record<PublicRegistrationStatus, { title: string; description: (name: string) => string }>> = {
  NOT_YET_OPEN: {
    title: 'Registration opens soon',
    description: (name) => `Registration for ${name} hasn't opened yet - check back soon, or ask the church office when it opens.`,
  },
  CLOSED: {
    title: 'Registration is closed',
    description: (name) => `Registration for ${name} isn't open right now. Please reach out to the church office if you have questions.`,
  },
};

export function PublicEventRegistrationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  const {
    data: event,
    isLoading,
    isError,
    error: loadError,
  } = useQuery({
    queryKey: ['public-event', slug],
    queryFn: () => publicEventsApi.getEvent(slug!).then((res) => res.data),
    enabled: !!slug,
    retry: false,
  });

  const notFound = (loadError as AxiosError | undefined)?.response?.status === 404;

  const fieldConfig = useMemo(() => (event ? publicFieldsToConfig(event.fields) : null), [event]);
  const schema = useMemo(() => (fieldConfig ? buildRegistrationSchema(fieldConfig) : null), [fieldConfig]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: fieldConfig ? defaultRegistrationValues(fieldConfig) : {},
  });

  const mutation = useMutation({
    mutationFn: (answers: EventRegistrationAnswers) => publicEventsApi.register(slug!, answers),
    onSuccess: (_res, answers) => {
      setSubmittedName(answers.firstName?.trim() || null);
    },
  });

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-center py-24">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      </PageShell>
    );
  }

  if (isError || !event || !fieldConfig) {
    return (
      <PageShell>
        <CenteredMessageCard
          icon={notFound ? SearchX : Frown}
          iconClassName={notFound ? 'bg-slate-100 text-slate-500' : 'bg-rose-100 text-rose-500'}
          title={notFound ? 'We can’t find that event' : 'Something went wrong'}
          description={
            notFound
              ? 'This link may be out of date, or the event isn’t published yet. Check with the church office for the current link.'
              : 'We had trouble loading this page. Please try again in a moment.'
          }
        />
      </PageShell>
    );
  }

  const heroImage = event.heroImageUrl && (
    <img
      src={event.heroImageUrl}
      alt={event.name}
      className="mb-6 aspect-[16/9] w-full rounded-2xl object-cover shadow-md"
    />
  );

  if (submittedName !== null || mutation.isSuccess) {
    return (
      <PageShell>
        {heroImage}
        <CenteredMessageCard
          icon={PartyPopper}
          iconClassName="bg-emerald-100 text-emerald-600"
          title={submittedName ? `We've got you, ${submittedName}!` : "We've got you!"}
          description={`See you ${formatEventDay(event.eventDate, 'EEEE, MMMM d')}${event.location ? ` at ${event.location}` : ''}.`}
        />
      </PageShell>
    );
  }

  if (event.registrationStatus === 'FULL') {
    return (
      <PageShell>
        {heroImage}
        <CenteredMessageCard
          icon={Frown}
          iconClassName="bg-amber-100 text-amber-600"
          title="This event is full"
          description={`${event.name} has reached capacity. Please reach out to the church office to ask about a waiting list.`}
        />
      </PageShell>
    );
  }

  if (event.registrationStatus !== 'OPEN') {
    const copy = CLOSED_STATE_COPY[event.registrationStatus];
    return (
      <PageShell>
        {heroImage}
        <CenteredMessageCard
          icon={CalendarX2}
          iconClassName="bg-amber-100 text-amber-600"
          title={copy?.title ?? 'Registration is closed'}
          description={copy?.description(event.name) ?? `Registration for ${event.name} isn't open right now.`}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      {heroImage}

      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">{event.name}</h1>
        <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm font-medium text-indigo-700">
          <CalendarClock className="h-3.5 w-3.5" />
          {formatEventWhen(event.eventDate, event.startTime, event.endTime)}
        </p>
        {event.location && (
          <p className="mt-1 flex items-center justify-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {event.location}
          </p>
        )}
      </div>

      {event.description && (
        <div
          className="prose prose-sm mb-6 max-w-none rounded-2xl bg-white p-5 text-slate-700 shadow-sm [&_a]:text-indigo-600 [&_img]:rounded-lg"
          // This page is public - anyone on the internet, logged in or not, can load
          // it - so admin-authored HTML is run through the shared sanitizer helper
          // before it's ever handed to dangerouslySetInnerHTML. See src/lib/sanitizeHtml.ts.
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }}
        />
      )}

      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values as EventRegistrationAnswers))}
        className="space-y-5 rounded-2xl bg-white p-6 shadow-lg sm:p-8"
      >
        {mutation.isError && (
          <Alert variant="error">
            {(mutation.error as AxiosError<ApiError>).response?.data?.message ??
              'We could not submit your registration. Please check the form and try again.'}
          </Alert>
        )}

        <EventRegistrationFields fields={fieldConfig} register={register} errors={errors} />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={mutation.isPending}
          leftIcon={<CheckCircle2 className="h-4 w-4" />}
        >
          Register
        </Button>
      </form>
    </PageShell>
  );
}
