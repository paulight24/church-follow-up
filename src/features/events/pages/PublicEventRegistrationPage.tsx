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
import { EVENT_FIELD_DEFS, buildRegistrationSchema, defaultRegistrationValues, publicFieldsToConfig } from '../lib/eventFields';
import type { RegistrationFormValues } from '../lib/eventFields';
import { EventRegistrationFields } from '../components/EventRegistrationFields';
import { formatEventDay, formatEventWhen } from '../lib/eventDate';
import { useSeo } from '@/lib/seo';
import { LanguageSwitcher, useTranslation } from '@/i18n';

/** Shared shell for every state of this page - centered, single-column, no app chrome. */
function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-6 sm:py-12">
      <div className="mx-auto w-full max-w-lg">
        {/* Auto-detection is usually right, but a visitor on a shared or
            English-set phone needs a visible way out. */}
        <div className="mb-3 flex justify-end">
          <LanguageSwitcher />
        </div>
        {children}
      </div>
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

/**
 * Drops answers the registrant left blank, so `optional` fields stay
 * optional — including inside the `custom` bag, which is one level deeper.
 */
function stripBlankAnswers(answers: EventRegistrationAnswers): EventRegistrationAnswers {
  const custom = Object.fromEntries(
    Object.entries(answers.custom ?? {}).filter(([, v]) => typeof v === 'string' && v.trim() !== ''),
  );
  const flat = Object.fromEntries(
    Object.entries(answers).filter(([k, v]) => k !== 'custom' && !(typeof v === 'string' && v.trim() === '')),
  ) as EventRegistrationAnswers;
  return Object.keys(custom).length > 0 ? { ...flat, custom } : flat;
}

/**
 * Turns the API's field-keyed validation details into lines a registrant can
 * act on. The keys arrive dotted and internal ("body.answers.dateOfBirth"), so
 * they get mapped back to the same labels the form renders. Without this the
 * page showed a bare "Validation failed" with no clue which field was wrong -
 * on a public page where the visitor cannot ask anyone what went wrong.
 */
function fieldErrorLines(errors: Record<string, string[]> | undefined): string[] {
  if (!errors) return [];
  return Object.entries(errors).map(([path, messages]) => {
    const key = path.split('.').pop() ?? path;
    const label = EVENT_FIELD_DEFS.find((f) => f.key === key)?.label ?? key;
    return `${label}: ${messages.join(', ')}`;
  });
}

export function PublicEventRegistrationPage() {
  const { t, locale } = useTranslation();

  // Reached by QR/flier for one church's event — not a search result.
  useSeo({
    title: 'Event Registration',
    description: 'Register for this church event.',
    noIndex: true,
  });

  const { slug } = useParams<{ slug: string }>();
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  // True when the submitter was already on the list and we updated their
  // answers instead of adding them twice — worth saying plainly, otherwise a
  // member who re-submits assumes they now have two places.
  const [wasAlreadyRegistered, setWasAlreadyRegistered] = useState(false);

  const {
    data: event,
    isLoading,
    isError,
    error: loadError,
  } = useQuery({
    queryKey: ['public-event', slug, locale],
    queryFn: () => publicEventsApi.getEvent(slug!, locale).then((res) => res.data),
    enabled: !!slug,
    retry: false,
  });

  const notFound = (loadError as AxiosError | undefined)?.response?.status === 404;

  const fieldConfig = useMemo(() => (event ? publicFieldsToConfig(event.fields) : null), [event]);
  const customFields = event?.customFields ?? [];
  const schema = useMemo(
    () => (fieldConfig ? buildRegistrationSchema(fieldConfig, customFields) : null),
    // customFields comes from the same fetched event as fieldConfig, so it
    // changes with it; serialised to keep the dependency by value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fieldConfig, JSON.stringify(customFields)]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: fieldConfig ? defaultRegistrationValues(fieldConfig, customFields) : {},
  });

  const mutation = useMutation({
    // An untouched optional input submits as "", which the API rejects rather
    // than reading as "not answered" - leaving the optional Date of Birth
    // blank used to fail the whole registration. The API tolerates blanks now
    // too; this keeps the request honest about what was actually filled in.
    mutationFn: (answers: EventRegistrationAnswers) =>
      publicEventsApi.register(slug!, stripBlankAnswers(answers)),
    onSuccess: (_res, answers) => {
      setSubmittedName(answers.firstName?.trim() || null);
      setWasAlreadyRegistered(Boolean(_res.data.alreadyRegistered));
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
          title={notFound ? t('event.notFoundTitle') : t('event.errorTitle')}
          description={notFound ? t('event.notFoundBody') : t('event.errorBody')}
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
          title={
            wasAlreadyRegistered
              ? submittedName
                ? t('event.alreadyTitleNamed', { name: submittedName })
                : t('event.alreadyTitle')
              : submittedName
                ? t('event.successTitleNamed', { name: submittedName })
                : t('event.successTitle')
          }
          description={
            (wasAlreadyRegistered ? t('event.alreadyNote') : '') +
            (event.location
              ? t('event.seeYouAt', {
                  when: formatEventDay(event.eventDate, 'EEEE, MMMM d', locale, 'PPP'),
                  location: event.location,
                })
              : t('event.seeYou', { when: formatEventDay(event.eventDate, 'EEEE, MMMM d', locale, 'PPP') }))
          }
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
          title={t('event.fullTitle')}
          description={t('event.fullBody', { event: event.name })}
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
          title={copy?.title ?? t('event.closedTitle')}
          description={copy?.description(event.name) ?? t('event.closedBody', { event: event.name })}
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
          {formatEventWhen(event.eventDate, event.startTime, event.endTime, undefined, locale)}
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
        {mutation.isError && (() => {
          const data = (mutation.error as AxiosError<ApiError>).response?.data;
          const lines = fieldErrorLines(data?.errors);
          return (
            <Alert variant="error">
              {data?.message ?? t('event.submitError')}
              {lines.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </Alert>
          );
        })()}

        <EventRegistrationFields
          fields={fieldConfig}
          customFields={customFields}
          register={register}
          errors={errors}
        />

        {/*
          Shown only when this event actually asks for a phone number. US
          carriers require the consent disclosure to appear where the number
          is collected — brand, message types, frequency, rates, and how to
          stop — and a toll-free/A2P reviewer opens this exact page as the
          opt-in evidence. Without it, registration is refused and messages
          are filtered.
        */}
        {fieldConfig.phone?.enabled && (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
            {t('event.smsConsent', {
              church: event.churchName ?? t('event.smsConsentChurchFallback'),
            })}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={mutation.isPending}
          leftIcon={<CheckCircle2 className="h-4 w-4" />}
        >
          {t('event.register')}
        </Button>
      </form>
    </PageShell>
  );
}
