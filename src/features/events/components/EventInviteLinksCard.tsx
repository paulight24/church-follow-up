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
import { Check, Copy, Link2, Plus, QrCode as QrCodeIcon, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import { QrCode } from '@/features/attendance/components/QrCode';
import { teamsApi } from '@/features/teams/api/teams.api';
import { eventsApi } from '../api/events.api';
import type { EventInviteLink } from '@/types/event';

function LinkRow({ eventId, link, canManage }: { eventId: string; link: EventInviteLink; canManage: boolean }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const toggle = useMutation({
    mutationFn: (active: boolean) => eventsApi.setInviteLinkActive(eventId, link.id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event-invite-links', eventId] }),
    onError: () => toast({ title: 'Could not change that link', variant: 'error' }),
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
            <Button
              variant="ghost"
              size="sm"
              isLoading={toggle.isPending}
              onClick={() => toggle.mutate(!link.active)}
            >
              {link.active ? 'Retire' : 'Restore'}
            </Button>
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
