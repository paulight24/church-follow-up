import { format, parse, parseISO } from 'date-fns';

/**
 * An event's `eventDate` is a **calendar date**, not an instant — "the 26th of
 * September" is the same day whether you read the flier in Los Angeles or Lagos.
 *
 * It is stored as a DateTime, so `new Date(eventDate)` yields an instant that
 * then gets rendered in the *viewer's* timezone. A row stored as UTC midnight
 * therefore displays as the previous day for anyone west of UTC — the public
 * registration page showed "Friday, September 25" for an event created on the
 * 26th. Creating an event through the UI happens to round-trip (it stores local
 * midnight), but that only holds while the author and the reader share a
 * timezone, which is exactly what a public page cannot assume.
 *
 * So: take the date part only and rebuild it as a local date. The calendar day
 * is then whatever was entered, for every viewer, however the row was written.
 */
export function toCalendarDate(eventDate: string): Date {
  return parseISO(eventDate.slice(0, 10));
}

/** e.g. "Saturday, September 26, 2026" */
export function formatEventDay(eventDate: string, pattern = 'EEEE, MMMM d, yyyy'): string {
  return format(toCalendarDate(eventDate), pattern);
}

/** Parses an "HH:mm" string against the event's calendar day. */
export function parseEventTime(eventDate: string, time: string): Date {
  return parse(time, 'HH:mm', toCalendarDate(eventDate));
}

/** e.g. "Saturday, September 26, 2026 · 6:00 PM – 9:00 PM" */
export function formatEventWhen(
  eventDate: string,
  startTime?: string | null,
  endTime?: string | null,
  dayPattern = 'EEEE, MMMM d, yyyy'
): string {
  const day = formatEventDay(eventDate, dayPattern);
  if (!startTime) return day;

  const start = format(parseEventTime(eventDate, startTime), 'h:mm a');
  if (!endTime) return `${day} · ${start}`;

  const end = format(parseEventTime(eventDate, endTime), 'h:mm a');
  return `${day} · ${start} – ${end}`;
}
