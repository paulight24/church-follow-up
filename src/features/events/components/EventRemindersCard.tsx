/**
 * Countdown reminder campaign, shown on a published event.
 *
 * The church sees the whole plan at a glance — announcement, then 3-days /
 * 1-day / day-of — with a tick on whatever has already gone out, a single
 * switch to turn the countdown off, and a "send now" for any milestone they
 * want to push early or that a downtime window missed. The schedule itself is
 * automatic (a daily server sweep); this card is visibility and override, not
 * a form to fill in.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellRing, CheckCircle2, Circle, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { eventsApi, type EventCampaign } from '../api/events.api';

type Offset = 'T3' | 'T1' | 'DAY_OF';
const MILESTONES: Array<{ key: Offset; label: string; sub: string }> = [
  { key: 'T3', label: '3 days to go', sub: 'A reminder while there is still time to plan' },
  { key: 'T1', label: 'Tomorrow', sub: 'The day-before nudge' },
  { key: 'DAY_OF', label: 'Today', sub: 'Morning-of, before the doors open' },
];

function sentWhen(iso?: string): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function EventRemindersCard({ eventId }: { eventId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const campaignQuery = useQuery({
    queryKey: ['event-campaign', eventId],
    queryFn: () => eventsApi.getCampaign(eventId).then((r) => r.data),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['event-campaign', eventId] });

  const toggle = useMutation({
    mutationFn: (enabled: boolean) => eventsApi.toggleReminders(eventId, enabled).then((r) => r.data),
    onSuccess: (c) => {
      invalidate();
      toast({ title: c.enabled ? 'Countdown reminders on' : 'Countdown reminders off', variant: 'success' });
    },
  });

  const sendNow = useMutation({
    mutationFn: (offset: Offset) => eventsApi.sendReminderNow(eventId, offset).then((r) => r.data),
    onSuccess: (r) => {
      invalidate();
      toast(
        r.skipped
          ? { title: `Not sent — ${r.skipped.replace(/-/g, ' ')}`, variant: 'error' }
          : { title: `Reminder sent to ${r.sent} member${r.sent === 1 ? '' : 's'}`, variant: 'success' }
      );
    },
    onError: () => toast({ title: 'Could not send that reminder', variant: 'error' }),
  });

  const campaign: EventCampaign | null | undefined = campaignQuery.data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <BellRing className="h-4 w-4 text-indigo-600" />
          Countdown reminders
        </CardTitle>
        {campaign && (
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              checked={campaign.enabled}
              disabled={toggle.isPending}
              onChange={(e) => toggle.mutate(e.target.checked)}
            />
            {campaign.enabled ? 'On' : 'Off'}
          </label>
        )}
      </CardHeader>
      <CardContent>
        {campaignQuery.isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner className="text-indigo-600" />
          </div>
        ) : !campaign ? (
          <p className="text-sm text-slate-500">
            Send the announcement first (the <span className="font-medium">Announce</span> button above). Once you do,
            the countdown schedule appears here and runs itself.
          </p>
        ) : (
          <div className="space-y-1">
            <Row
              done={Boolean(campaign.sent.announce)}
              label="Announcement"
              sub="The first invitation to the whole church"
              when={sentWhen(campaign.sent.announce)}
            />
            {MILESTONES.map((m) => (
              <Row
                key={m.key}
                done={Boolean(campaign.sent[m.key])}
                label={m.label}
                sub={m.sub}
                when={sentWhen(campaign.sent[m.key])}
                action={
                  !campaign.sent[m.key] && campaign.enabled ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Send className="h-3.5 w-3.5" />}
                      isLoading={sendNow.isPending && sendNow.variables === m.key}
                      onClick={() => sendNow.mutate(m.key)}
                    >
                      Send now
                    </Button>
                  ) : null
                }
              />
            ))}
            <p className="pt-2 text-xs text-slate-400">
              Reminders go out automatically each morning as the day arrives. Everyone with an email on file receives
              them; members who have opted out never do.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Row({
  done,
  label,
  sub,
  when,
  action,
}: {
  done: boolean;
  label: string;
  sub: string;
  when: string | null;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
      {done ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
      ) : (
        <Circle className="h-5 w-5 shrink-0 text-slate-300" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="truncate text-xs text-slate-500">{done && when ? `Sent ${when}` : sub}</p>
      </div>
      {action}
    </div>
  );
}
