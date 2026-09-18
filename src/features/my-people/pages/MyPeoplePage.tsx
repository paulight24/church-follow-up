import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Phone, MessageSquare, Users } from 'lucide-react';
import { getMyPeople, type MyPerson } from '../api';
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

function PersonCard({ person }: { person: MyPerson }) {
  const last = lastContactLabel(person.lastContactedAt);
  // tel: and sms: rather than a dialer page — on the phone this is opened on,
  // these hand straight to the app that makes the call.
  const tel = person.phonePrimary?.replace(/[^\d+]/g, '');

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
