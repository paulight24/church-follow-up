import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Phone, MessageSquare, Users, NotebookPen, Cake } from 'lucide-react';
import { getMyPeople, type MyPerson } from '../api';
import { LogContactDialog } from '../components/LogContactDialog';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';

/**
 * The first screen after signing in: the people this user is responsible for.
 *
 * It deliberately reads assignments rather than follow-up tasks. A task only
 * exists once somebody runs a follow-up cycle, and in a church where nobody
 * has, every task list in the building reads zero while team leads have ten
 * people each. Showing the assignment shows the work that actually exists.
 *
 * Written for a volunteer checking their phone after service, not for an
 * administrator at a desk: one card per person, the phone number as the
 * primary action, and no filters, tabs or counts to read past first.
 */

/** "3 weeks ago", or the invitation to start when nobody has called yet. */
function lastContactLabel(iso: string | null): { text: string; urgent: boolean } {
  if (!iso) return { text: 'Not contacted yet', urgent: true };
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return { text: 'Contacted today', urgent: false };
  if (days === 1) return { text: 'Contacted yesterday', urgent: false };
  if (days < 7) return { text: `Contacted ${days} days ago`, urgent: false };
  if (days < 14) return { text: 'Contacted last week', urgent: false };
  if (days < 61) return { text: `Contacted ${Math.floor(days / 7)} weeks ago`, urgent: days > 30 };
  return { text: `Contacted ${Math.floor(days / 30)} months ago`, urgent: true };
}

/**
 * "Birthday today" / "Birthday in 3 days", or nothing at all.
 *
 * Deliberately month-and-day only: the API withholds the birth year from
 * anyone without `members.view_full_dob`, and a volunteer does not need
 * someone's age to wish them well. Anything further out than a fortnight is
 * not something to act on today, so it is not shown.
 */
function birthdayNote(monthDay: string | null): string | null {
  if (!monthDay) return null;
  const [m, d] = monthDay.split('-').map(Number);
  if (!m || !d) return null;
  const today = new Date();
  // Compared in local time against a local "today": this is a wall-calendar
  // question ("is it their birthday where they are?"), not an instant.
  let next = new Date(today.getFullYear(), m - 1, d);
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (next < midnight) next = new Date(today.getFullYear() + 1, m - 1, d);
  const days = Math.round((next.getTime() - midnight.getTime()) / 86_400_000);
  if (days === 0) return 'Birthday today';
  if (days === 1) return 'Birthday tomorrow';
  if (days <= 14) return `Birthday in ${days} days`;
  return null;
}

function PersonCard({ person }: { person: MyPerson }) {
  const [logging, setLogging] = useState(false);
  const last = lastContactLabel(person.lastContactedAt);
  const birthday = birthdayNote(person.birthdayMonthDay);
  // tel: and sms: rather than a dialer page — on the phone this is opened on,
  // these hand straight to the app that makes the call.
  const tel = person.phonePrimary?.replace(/[^\d+]/g, '');
  // wa.me wants digits only, no leading +. It opens the app on a phone and
  // WhatsApp Web on a desktop, so one link serves both.
  const wa = tel?.replace(/^\+/, '');

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/members/${person.id}`}
            className="truncate text-base font-semibold text-slate-900 hover:text-indigo-700 hover:underline"
          >
            {person.displayName}
          </Link>
          <p className={`mt-0.5 text-sm ${last.urgent ? 'font-medium text-amber-700' : 'text-slate-500'}`}>
            {last.text}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {person.isFirstTimer && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                First timer
              </span>
            )}
            {person.assignmentRole === 'BACKUP' && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                Backup
              </span>
            )}
            {birthday && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                <Cake className="h-3 w-3" />
                {birthday}
              </span>
            )}
            {person.team && (
              <span className="truncate rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {person.team.name}
              </span>
            )}
          </div>
        </div>

        {tel ? (
          <div className="flex shrink-0 gap-2">
            <a
              href={`sms:${tel}`}
              aria-label={`Text ${person.displayName}`}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 text-slate-600 transition hover:bg-slate-50"
            >
              <MessageSquare className="h-5 w-5" />
            </a>
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${person.displayName}`}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#25d366] text-white shadow-sm transition hover:bg-[#1eb855]"
            >
              {/* Inline mark: the button must not wait on a network request. */}
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.896 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
              </svg>
            </a>
            <a
              href={`tel:${tel}`}
              aria-label={`Call ${person.displayName}`}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Phone className="h-5 w-5" />
            </a>
          </div>
        ) : (
          <span className="shrink-0 rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
            No phone
          </span>
        )}
      </div>

      {/* Full width and under the call button on purpose: it is the step that
          happens after the call, and it is the one that makes the next
          person's list useful. */}
      <button
        type="button"
        onClick={() => setLogging(true)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <NotebookPen className="h-4 w-4" />
        Log a call
      </button>

      <LogContactDialog
        memberId={person.id}
        memberName={person.displayName}
        isOpen={logging}
        onClose={() => setLogging(false)}
      />
    </li>
  );
}

export function MyPeoplePage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-people'],
    queryFn: getMyPeople,
  });

  const firstName = user?.firstName ?? '';
  const people = data ?? [];
  const uncontacted = people.filter((p) => !p.lastContactedAt).length;

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">
          {firstName ? `Hello, ${firstName}` : 'My People'}
        </h1>
        <p className="mt-1 text-slate-600">
          {isLoading
            ? 'Loading the people assigned to you…'
            : people.length === 0
              ? 'Nobody is assigned to you yet.'
              : uncontacted > 0
                ? `${people.length} ${people.length === 1 ? 'person is' : 'people are'} assigned to you — ${uncontacted} not contacted yet.`
                : `${people.length} ${people.length === 1 ? 'person is' : 'people are'} assigned to you.`}
        </p>
      </header>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          We could not load your list just now. Please refresh the page.
        </div>
      )}

      {!isLoading && !isError && people.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Users className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-medium text-slate-700">No one is assigned to you yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            When your team lead assigns someone for you to follow up, they will appear here.
          </p>
        </div>
      )}

      {people.length > 0 && (
        <ul className="space-y-3">
          {people.map((p) => (
            <PersonCard key={p.id} person={p} />
          ))}
        </ul>
      )}
    </div>
  );
}
