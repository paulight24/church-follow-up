/**
 * Per-person registration links for an event.
 *
 * What the church actually does with this screen is copy a link into a
 * WhatsApp message, so each row is built around that one action: a name, the
 * count it has brought in, and a copy button. The QR sits behind a toggle
 * because it matters for a printed flier and is clutter the rest of the time.
 */
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Copy, Download, Link2, Mail, Pencil, Plus, QrCode as QrCodeIcon, Sparkles, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import { QrCode } from '@/features/attendance/components/QrCode';
import { teamsApi } from '@/features/teams/api/teams.api';
import { downloadCsv } from '@/lib/downloadCsv';
import { eventsApi } from '../api/events.api';
import type { EventInviteLink } from '@/types/event';

function LinkRow({ eventId, link, canManage }: { eventId: string; link: EventInviteLink; canManage: boolean }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const toggle = useMutation({
    mutationFn: (active: boolean) => eventsApi.updateInviteLink(eventId, link.id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event-invite-links', eventId] }),
    onError: () => toast({ title: 'Could not change that link', variant: 'error' }),
  });

  const rename = useMutation({
    mutationFn: (label: string) => eventsApi.updateInviteLink(eventId, link.id, { label }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event-invite-links', eventId] }),
    onError: () => toast({ title: 'Could not rename that link', variant: 'error' }),
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable; the URL is selectable in the row.
    }
  }

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-900">{link.label}</span>
            <Badge variant={link.registrationCount > 0 ? 'success' : 'gray'}>
              <Users className="mr-1 inline h-3 w-3" />
              {link.registrationCount}
            </Badge>
            {link.firstTimerCount > 0 && (
              // The number that says a link reached past the people who were
              // coming anyway.
              <Badge variant="purple">{link.firstTimerCount} first-timers</Badge>
            )}
            {!link.active && <Badge variant="gray">Retired</Badge>}
          </div>
          <p className="mt-0.5 truncate font-mono text-xs text-slate-500">{link.url}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            leftIcon={copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            onClick={copy}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <button
            type="button"
            aria-label="Show QR code"
            className={`rounded p-1.5 ${showQr ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
            onClick={() => setShowQr((v) => !v)}
          >
            <QrCodeIcon className="h-4 w-4" />
          </button>
          {canManage && (
            <>
              <button
                type="button"
                aria-label="Rename this link"
                className="rounded p-1.5 text-slate-400 hover:bg-slate-100"
                onClick={() => {
                  const next = window.prompt('What should this link be called?', link.label);
                  // Cancel returns null; an empty string clears it and the
                  // list falls back to the owner's own name.
                  if (next !== null) rename.mutate(next);
                }}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <Button
                variant="ghost"
                size="sm"
                isLoading={toggle.isPending}
                onClick={() => toggle.mutate(!link.active)}
              >
                {link.active ? 'Retire' : 'Restore'}
              </Button>
            </>
          )}
        </div>
      </div>

      {showQr && (
        <div className="mt-3 flex justify-center rounded-xl border border-slate-200 bg-white p-3">
          <QrCode value={link.url} size={150} aria-label={`Registration QR code for ${link.label}`} />
        </div>
      )}
    </li>
  );
}

export function EventInviteLinksCard({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const canManage = usePermission('events.update');
  const [teamId, setTeamId] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');

  const { data: links, isLoading, isError } = useQuery({
    queryKey: ['event-invite-links', eventId],
    queryFn: () => eventsApi.getInviteLinks(eventId).then((res) => res.data),
    retry: false,
  });

  const { data: teams } = useQuery({
    queryKey: ['teams', 'for-invite-links'],
    queryFn: () => teamsApi.getTeams({ pageSize: 100 }).then((res) => res.data.data),
    enabled: canManage,
  });

  // The people on the chosen team, which is also the guard the API enforces:
  // a link assigns into a team, and assigning to someone who is not on it
  // leaves nobody to escalate to.
  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamsApi.getTeam(teamId).then((res) => res.data),
    enabled: canManage && Boolean(teamId),
  });

  const { data: summary } = useQuery({
    queryKey: ['event-invite-links-summary', eventId],
    queryFn: () => eventsApi.getInviteLinkSummary(eventId).then((res) => res.data),
  });

  const bulk = useMutation({
    mutationFn: () => eventsApi.bulkCreateInviteLinks(eventId, teamId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['event-invite-links', eventId] });
      toast({ title: res.data.created === 0 ? 'Everyone already has one' : `Created ${res.data.created}`, variant: 'success' });
    },
    onError: () => toast({ title: 'Could not create those links', variant: 'error' }),
  });

  const notify = useMutation({
    mutationFn: (channel: 'in_app' | 'email' | 'both') =>
      eventsApi.notifyInviteLinkOwners(eventId, channel),
    onSuccess: (res, channel) => {
      const parts = [];
      if (channel !== 'email') parts.push(`${res.data.sent} in-app`);
      if (channel !== 'in_app') parts.push(`${res.data.emailed} emailed`);
      toast({
        title: parts.join(' · '),
        description: res.data.noEmail > 0 ? `${res.data.noEmail} have no email address on file.` : undefined,
        variant: 'success',
      });
    },
    onError: () => toast({ title: 'Could not send those', variant: 'error' }),
  });

  const alreadyLinked = useMemo(
    () => new Set((links ?? []).map((l) => l.ownerUserId)),
    [links]
  );

  const create = useMutation({
    mutationFn: () => eventsApi.createInviteLink(eventId, { ownerUserId, teamId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-invite-links', eventId] });
      setOwnerUserId('');
      toast({ title: 'Link ready to share', variant: 'success' });
    },
    onError: () => toast({ title: 'Could not create that link', variant: 'error' }),
  });

  const candidates = (team?.teamUsers ?? []).filter((tu) => !alreadyLinked.has(tu.userId));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4 text-indigo-600" />
          Personal registration links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Give each team member their own link. Anyone who registers through it becomes theirs to
          follow up — unless that person is already assigned to someone else, in which case they stay
          where they are.
        </p>

        {summary && summary.total > 0 && (
          // The denominator matters more than the ranking: without "came
          // straight off the flier" a church reads the leaderboard as the
          // whole story.
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-white p-3 text-center">
            <div>
              <p className="text-lg font-semibold tabular-nums text-slate-900">{summary.viaLinks}</p>
              <p className="text-xs text-slate-500">through a link</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums text-slate-900">{summary.direct}</p>
              <p className="text-xs text-slate-500">straight off the flier</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums text-indigo-700">
                {summary.firstTimersViaLinks}
              </p>
              <p className="text-xs text-slate-500">first-timers via links</p>
            </div>
          </div>
        )}

        {canManage && (
          <div className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_auto]">
            <Select
              label="Team"
              value={teamId}
              onChange={(e) => {
                setTeamId(e.target.value);
                setOwnerUserId('');
              }}
              options={[
                { value: '', label: 'Choose a team…' },
                ...(teams ?? []).map((t) => ({ value: t.id, label: t.name })),
              ]}
            />
            <Select
              label="Person"
              value={ownerUserId}
              disabled={!teamId}
              onChange={(e) => setOwnerUserId(e.target.value)}
              options={[
                {
                  value: '',
                  label: !teamId
                    ? 'Choose a team first'
                    : candidates.length === 0
                      ? 'Everyone on this team has one'
                      : 'Choose a person…',
                },
                ...candidates.map((tu) => ({
                  value: tu.userId,
                  label: `${tu.user.firstName} ${tu.user.lastName}`.trim(),
                })),
              ]}
            />
            <div className="flex items-end">
              <Button
                className="w-full sm:w-auto"
                isLoading={create.isPending}
                disabled={!teamId || !ownerUserId}
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => create.mutate()}
              >
                Create link
              </Button>
            </div>
            <div className="sm:col-span-3">
              <Button
                variant="outline"
                size="sm"
                isLoading={bulk.isPending}
                disabled={!teamId}
                leftIcon={<Sparkles className="h-4 w-4" />}
                onClick={() => bulk.mutate()}
              >
                Give everyone on this team a link
              </Button>
            </div>
          </div>
        )}

        {canManage && links && links.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Download className="h-3.5 w-3.5" />}
              onClick={() =>
                downloadCsv(
                  'registration-links.csv',
                  links.map((l) => ({
                    Person: l.ownerName,
                    Team: l.teamName,
                    Link: l.url,
                    Registrations: l.registrationCount,
                    'First-timers': l.firstTimerCount,
                    Active: l.active ? 'yes' : 'retired',
                  }))
                )
              }
            >
              Export CSV
            </Button>
            <Button
              variant="ghost"
              size="sm"
              isLoading={notify.isPending && notify.variables === 'in_app'}
              leftIcon={<Bell className="h-3.5 w-3.5" />}
              onClick={() => notify.mutate('in_app')}
            >
              Notify in-app
            </Button>
            <Button
              variant="outline"
              size="sm"
              isLoading={notify.isPending && notify.variables === 'email'}
              leftIcon={<Mail className="h-3.5 w-3.5" />}
              onClick={() => notify.mutate('email')}
            >
              Email everyone their link
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="text-indigo-600" />
          </div>
        ) : isError ? (
          // Distinguished from "none yet" on purpose. Both used to render the
          // same empty state, so a card that could not reach the server said
          // there were no links — which is a different thing, and the more
          // alarming of the two to be wrong about.
          <p className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-6 text-center text-sm text-amber-800">
            Could not load the links for this event. Refresh in a moment — if it keeps happening, the
            server may still be updating.
          </p>
        ) : !links || links.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
            No personal links yet.
            {canManage
              ? ' Pick a team and a person above to make the first one.'
              : ' An organiser can create one for you.'}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {links.map((link) => (
              <LinkRow key={link.id} eventId={eventId} link={link} canManage={canManage} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
