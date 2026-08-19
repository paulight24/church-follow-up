import { format, parse, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { zhCN } from 'date-fns/locale/zh-CN';
import type { Locale as DateFnsLocale } from 'date-fns';

/**
 * date-fns formats month and weekday names in English unless handed a locale.
 * On a fully-translated registration page that left the one line a visitor
 * most needs - the date they are being asked to show up - reading "Saturday,
 * September 26" under Spanish copy. Locales are imported rather than loaded
 * dynamically because there are only two and they are small; a missing entry
 * falls through to English, which is also the `en` behaviour.
 */
const DATE_LOCALES: Record<string, DateFnsLocale> = { es, zh: zhCN };

export function dateLocale(locale?: string): DateFnsLocale | undefined {
  return locale ? DATE_LOCALES[locale] : undefined;
}

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

/**
 * e.g. "Saturday, September 26, 2026" — or "sábado, 26 de septiembre de 2026",
 * "2026年9月26日 星期六".
 *
 * `pattern` is an English-shaped template ("EEEE, MMMM d, yyyy"): handing it a
 * Spanish locale translates the words but keeps English word order, giving
 * "sábado, septiembre 26" where Spanish wants "sábado, 26 de septiembre". So a
 * translated page uses date-fns's locale-aware tokens (PPPP/PPP) instead,
 * which each locale defines in its own conventional order. English is left on
 * the explicit pattern so its output is unchanged.
 */
export function formatEventDay(
  eventDate: string,
  pattern = 'EEEE, MMMM d, yyyy',
  locale?: string,
  localizedToken: 'PPPP' | 'PPP' = 'PPPP'
): string {
  const dfLocale = dateLocale(locale);
  return format(toCalendarDate(eventDate), dfLocale ? localizedToken : pattern, { locale: dfLocale });
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
  dayPattern = 'EEEE, MMMM d, yyyy',
  locale?: string
): string {
  const dfLocale = dateLocale(locale);
  const day = formatEventDay(eventDate, dayPattern, locale);
  if (!startTime) return day;

  // 'p' is the locale's own clock convention — Spanish reads 18:00, not 6:00 PM.
  const timeToken = dfLocale ? 'p' : 'h:mm a';
  const start = format(parseEventTime(eventDate, startTime), timeToken, { locale: dfLocale });
  if (!endTime) return `${day} · ${start}`;

  const end = format(parseEventTime(eventDate, endTime), timeToken, { locale: dfLocale });
  return `${day} · ${start} – ${end}`;
}
