/**
 * A quiet countdown for the public registration page.
 *
 * Two decisions worth keeping:
 *
 * 1. **It counts to whichever deadline actually binds the visitor.** When an
 *    event closes registration before it starts — the Open Mic form shuts a
 *    week early so submissions can be reviewed — the date in the hero is not
 *    the date that matters to someone still deciding. So a `registrationClosesAt`
 *    that falls before the start wins, and the label says so.
 *
 * 2. **Seconds always tick.** The first church to use this asked for them
 *    explicitly: a second hand is the part that creates urgency, and a
 *    countdown that only moves once a minute reads as decoration. The row
 *    drops the days cell once it would read "00", and warms to amber inside
 *    the last two days, so it tightens as the deadline approaches instead of
 *    changing shape.
 */
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import { parseEventTime, toCalendarDate } from '../lib/eventDate';

/** Inside this much, the deadline is close enough to say so in colour. */
const URGENT_MS = 48 * 60 * 60 * 1000;

export function EventCountdown({
  eventDate,
  startTime,
  registrationClosesAt,
}: {
  eventDate: string;
  startTime?: string | null;
  registrationClosesAt?: string | null;
}) {
  const { t } = useTranslation();

  const target = useMemo(() => {
    // Same calendar-date handling as the line above it in the hero, so the
    // countdown can never disagree with the date the visitor is reading.
    const start = startTime ? parseEventTime(eventDate, startTime) : toCalendarDate(eventDate);
    const closes = registrationClosesAt ? new Date(registrationClosesAt) : null;
    if (closes && !Number.isNaN(closes.getTime()) && closes.getTime() < start.getTime()) {
      return { at: closes.getTime(), label: t('event.countdownToClose') };
    }
    return { at: start.getTime(), label: t('event.countdownToStart') };
  }, [eventDate, startTime, registrationClosesAt, t]);

  const [now, setNow] = useState(() => Date.now());
  const remaining = target.at - now;
  const expired = remaining <= 0;
  const urgent = remaining <= URGENT_MS;

  useEffect(() => {
    if (expired) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [expired]);

  // The page already renders a "registration is closed" state of its own; a
  // countdown at zero would only be a second, worse way of saying it.
  if (expired || Number.isNaN(target.at)) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const units = [
    // Dropped rather than shown as "00": a dead cell on the left makes the
    // whole row read as broken on the day itself.
    ...(days > 0 ? [{ value: days, label: t('event.countdownDays') }] : []),
    { value: Math.floor((totalSeconds % 86400) / 3600), label: t('event.countdownHours') },
    { value: Math.floor((totalSeconds % 3600) / 60), label: t('event.countdownMinutes') },
    { value: totalSeconds % 60, label: t('event.countdownSeconds') },
  ];

  return (
    <div
      role="timer"
      // Announcing every tick would make a screen reader unusable on this
      // page, so the digits are hidden from the tree and the container carries
      // one static summary instead.
      aria-live="off"
      aria-label={`${target.label}: ${units.map((u) => `${u.value} ${u.label}`).join(', ')}`}
      className={`mb-6 flex flex-col items-center justify-center gap-1.5 rounded-xl border px-4 py-3 sm:flex-row sm:gap-3 ${
        urgent ? 'border-amber-200 bg-amber-50/70' : 'border-indigo-100 bg-white/70'
      }`}
    >
      <span
        className={`text-[11px] font-semibold uppercase tracking-wide ${
          urgent ? 'text-amber-700' : 'text-indigo-700'
        }`}
      >
        {target.label}
      </span>
      <span className="hidden h-4 w-px bg-slate-200 sm:block" aria-hidden="true" />
      <div className="flex items-baseline gap-2" aria-hidden="true">
        {units.map((unit) => (
          <div key={unit.label} className="flex items-baseline gap-1">
            {/* tabular-nums so the row does not twitch sideways as digits change. */}
            <span
              className={`text-lg font-semibold tabular-nums ${urgent ? 'text-amber-800' : 'text-slate-900'}`}
            >
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-slate-500">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
