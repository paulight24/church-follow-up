/**
 * Send an event to the whole congregation — with the sample-first flow the
 * church actually uses: the real email goes to a couple of named inboxes,
 * someone reads it on a phone, and only then does anyone press the button
 * that reaches every member.
 *
 * The full send requires typing nothing but does require a second explicit
 * click on a button that states the recipient count — a congregation-wide
 * send should never be one accidental click.
 */
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Send, Users, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { eventsApi, type AnnounceJob } from '../api/events.api';

function errorMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}

const FLIERS_KEY = (id: string) => `event.announce.flierUrls.${id}`;

export function EventAnnounceModal({
  eventId,
  eventName,
  onClose,
}: {
  eventId: string;
  eventName: string;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [testEmails, setTestEmails] = useState('');
  const [subject, setSubject] = useState('');
  // Flier URLs survive the round trip from "send me the sample" to "send to
  // everyone" (often a different day) via localStorage — the full send must
  // be the email that was approved, not a from-memory reconstruction.
  const [flierUrls, setFlierUrls] = useState(() => localStorage.getItem(FLIERS_KEY(eventId)) ?? '');
  const [note, setNote] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [eligible, setEligible] = useState<number | null>(null);

  const statusQuery = useQuery({
    queryKey: ['event-announce-status', eventId],
    queryFn: () => eventsApi.announceStatus(eventId, 'email').then((r) => r.data),
    refetchInterval: (q) => (q.state.data && !q.state.data.finishedAt ? 2000 : false),
  });

  const parsedFliers = () =>
    flierUrls
      .split(/[\n,]/)
      .map((u) => u.trim())
      .filter(Boolean);

  const test = useMutation({
    mutationFn: () =>
      eventsApi
        .announceTest(eventId, {
          emails: testEmails.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean),
          flierUrls: parsedFliers(),
          note: note.trim() || undefined,
          subject: subject.trim() || undefined,
        })
        .then((r) => r.data),
    onSuccess: (data) => {
      localStorage.setItem(FLIERS_KEY(eventId), flierUrls);
      setEligible(data.eligibleForFullSend);
      const bad = data.results.filter((r) => r.status !== 'SENT');
      toast(
        bad.length === 0
          ? { title: 'Sample sent — check the inbox', variant: 'success' }
          : {
              title: 'Sample did not go out',
              description: bad.map((b) => `${b.to}: ${b.reason ?? b.status}`).join(' · '),
              variant: 'error',
            }
      );
    },
    onError: (err: unknown) =>
      toast({ title: 'Could not send the sample', description: errorMessage(err, ''), variant: 'error' }),
  });

  const send = useMutation({
    mutationFn: () =>
      eventsApi
        .announceSend(eventId, {
          channel: 'email',
          confirm: true,
          flierUrls: parsedFliers(),
          note: note.trim() || undefined,
          subject: subject.trim() || undefined,
        })
        .then((r) => r.data),
    onSuccess: (job) => {
      setConfirming(false);
      toast({ title: `Sending to ${job.total} members`, description: 'Runs in the background — progress below.', variant: 'success' });
      void queryClient.invalidateQueries({ queryKey: ['event-announce-status', eventId] });
    },
    onError: (err: unknown) =>
      toast({ title: 'Could not start the send', description: errorMessage(err, ''), variant: 'error' }),
  });

  const job: AnnounceJob | null | undefined = statusQuery.data;

  return (
    <Modal isOpen onClose={onClose} title={`Announce “${eventName}”`}>
      <div className="space-y-5">
        {/* Step 1 — sample */}
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Mail className="h-4 w-4 text-indigo-600" />
            1. Send yourself the sample first
          </h3>
          <Input
            label="Send sample to (up to 5 addresses)"
            placeholder="you@example.com, teammate@example.com"
            value={testEmails}
            onChange={(e) => setTestEmails(e.target.value)}
          />
          <Input
            label="Subject line"
            placeholder="You&apos;re invited: A Day of Blessing — this Sunday"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Textarea
            label="Flier image URLs (one per line — shown full-width in the email)"
            placeholder="/fliers/day-of-blessing-en.jpg"
            rows={2}
            value={flierUrls}
            onChange={(e) => setFlierUrls(e.target.value)}
          />
          <Input
            label="Optional note above the flier"
            placeholder="We look forward to seeing you and your family!"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button
            variant="outline"
            leftIcon={<Send className="h-4 w-4" />}
            isLoading={test.isPending}
            disabled={!testEmails.trim()}
            onClick={() => test.mutate()}
          >
            Send sample
          </Button>
        </section>

        {/* Step 2 — everyone */}
        <section className="space-y-3 border-t border-slate-100 pt-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Users className="h-4 w-4 text-indigo-600" />
            2. Then send to everyone
          </h3>
          {!confirming ? (
            <Button
              onClick={() => setConfirming(true)}
              disabled={send.isPending || Boolean(job && !job.finishedAt)}
            >
              Send to every member with an email…
            </Button>
          ) : (
            <div className="space-y-2 rounded-lg bg-amber-50 p-3">
              <p className="flex items-start gap-2 text-sm text-amber-900">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                This emails {eligible !== null ? `about ${eligible}` : 'every'} member
                {eligible === null ? 's' : ''} with an address on file. It cannot be recalled.
              </p>
              <div className="flex gap-2">
                <Button size="sm" isLoading={send.isPending} onClick={() => send.mutate()}>
                  Yes — send to everyone now
                </Button>
                <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* progress */}
        {job && (
          <section className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
            <p className="flex items-center gap-2 font-medium">
              {job.finishedAt ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-600" />
              )}
              {job.finishedAt ? 'Finished' : 'Sending…'} — {job.sent} delivered
              {job.failed > 0 && `, ${job.failed} failed`}
              {job.simulated > 0 && `, ${job.simulated} not actually sent (server not in live mode)`}
              {' of '}
              {job.total}
            </p>
            {job.failures.length > 0 && (
              <ul className="mt-1.5 list-inside list-disc text-xs text-slate-500">
                {job.failures.slice(0, 5).map((f, i) => (
                  <li key={i}>
                    {f.to}: {f.reason}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </Modal>
  );
}
