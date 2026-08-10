import type { MediaAssetSummary } from '@/types/encouragement';

// Matches backend EVENT_STATUSES (src/modules/events/events.types.ts). Only DRAFT and
// PUBLISHED have dedicated UI actions here (publish/unpublish) - CLOSED/CANCELLED are
// modeled so status displays never break if a event reaches one of those states some
// other way, even though this feature doesn't add its own controls for setting them.
export const EVENT_STATUSES = ['DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

/** The fixed catalogue of optional registration fields a church can toggle on/off per event. */
export const EVENT_FIELD_KEYS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'dateOfBirth',
  'weddingAnniversary',
  'prayerRequest',
] as const;
export type EventFieldKey = (typeof EVENT_FIELD_KEYS)[number];

export interface EventFieldToggle {
  enabled: boolean;
  required: boolean;
}

/** One toggle+required pair per catalogue field - this is the "field configuration" the church edits. */
export type EventFieldConfig = Record<EventFieldKey, EventFieldToggle>;

export interface EventUserRef {
  id: string;
  firstName: string;
  lastName: string;
}

/** Admin-facing event record - full CRUD shape, returned by /events endpoints. */
export interface EventRecord {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  heroImageAssetId?: string | null;
  heroImage?: MediaAssetSummary | null;
  /** Backend-computed absolute URL for heroImage - prefer this over building one client-side. */
  heroImageUrl?: string | null;
  eventDate: string;
  /** Local clock time, "HH:mm" (24-hour) - kept separate from eventDate, same as backend. */
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  status: EventStatus;
  capacity?: number | null;
  registrationOpensAt?: string | null;
  registrationClosesAt?: string | null;
  fields: EventFieldConfig;
  registrationCount?: number;
  createdById?: string | null;
  createdBy?: EventUserRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventRequest {
  name: string;
  slug: string;
  description?: string;
  heroImageAssetId?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  capacity?: number | null;
  registrationOpensAt?: string;
  registrationClosesAt?: string;
  fields: EventFieldConfig;
}

export interface UpdateEventRequest {
  name?: string;
  slug?: string;
  description?: string | null;
  heroImageAssetId?: string | null;
  eventDate?: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  capacity?: number | null;
  registrationOpensAt?: string | null;
  registrationClosesAt?: string | null;
  fields?: EventFieldConfig;
}

export interface EventListFilters {
  status?: EventStatus | '';
  page?: number;
  pageSize?: number;
}

export const EVENT_REGISTRATION_STATUSES = ['CONFIRMED', 'CANCELLED'] as const;
export type EventRegistrationStatus = (typeof EVENT_REGISTRATION_STATUSES)[number];

export interface EventRegistrationMemberRef {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phonePrimary?: string | null;
}

/**
 * One submitted registration, as returned by GET /events/:id/registrations. Answers are
 * whatever the registrant actually typed (only the keys the event's field config asked
 * for); `member` is the Member row the registration got linked/created against, which may
 * carry a value even for a field this event didn't collect on its own form.
 */
export interface EventRegistration {
  id: string;
  status: EventRegistrationStatus;
  submittedAt: string;
  member: EventRegistrationMemberRef | null;
  answers: Partial<Record<EventFieldKey, string>>;
}

/** One flattened row from GET /events/:id/registrations/export - already CSV-ready. */
export interface EventRegistrationExportRow {
  registrationId: string;
  submittedAt: string;
  status: EventRegistrationStatus;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  weddingAnniversary: string;
  prayerRequest: string;
}

export type PublicRegistrationStatus = 'OPEN' | 'NOT_YET_OPEN' | 'CLOSED' | 'FULL';

/**
 * Shape returned by the unauthenticated GET /public/events/:slug. Deliberately narrower
 * than EventRecord - no ids the public has no business seeing. `fields` is only the
 * enabled subset (with each one's required flag) rather than the full catalogue map the
 * admin side gets, and `registrationStatus` is always computed authoritatively by the
 * backend, so the page can show the right kind state up front rather than only
 * discovering it when the registrant tries to submit.
 */
export interface PublicEvent {
  name: string;
  slug: string;
  description?: string | null;
  heroImageUrl?: string | null;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  registrationOpensAt?: string | null;
  registrationClosesAt?: string | null;
  registrationStatus: PublicRegistrationStatus;
  fields: Array<{ key: EventFieldKey; required: boolean }>;
}

/** Public submission payload - only ever contains keys for fields the event has enabled. */
export type EventRegistrationAnswers = Partial<Record<EventFieldKey, string>>;

/** POST /public/events/:slug/register body - the backend wraps answers in this envelope. */
export interface PublicRegisterRequest {
  answers: EventRegistrationAnswers;
}
