import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { logContact, type ContactOutcome } from '../api';

/**
 * "What happened when you called?" — written for a volunteer on a phone, not
 * for someone filling in a form.
 *
 * The outcome list is deliberately short. The API accepts thirteen codes; a
 * worker standing in a car park does not want to choose between VOICEMAIL,
 * BUSY and NO_ANSWER, so those collapse into one button and the rarer codes
 * are simply not offered here. Anyone who needs the full vocabulary has the
 * task-based screen.
 */
const OUTCOMES: Array<{ code: ContactOutcome; label: string; hint?: string; tone: 'good' | 'neutral' | 'warn' }> = [
  { code: 'SUCCESSFUL', label: 'Spoke with them', tone: 'good' },
  { code: 'WILL_ATTEND', label: 'Coming to church', tone: 'good' },
  { code: 'NO_ANSWER', label: 'No answer', hint: 'Voicemail or busy too', tone: 'neutral' },
  { code: 'NEEDS_PRAYER', label: 'Asked for prayer', tone: 'good' },
  { code: 'NEEDS_PASTORAL_CARE', label: 'Needs a pastor', hint: 'Raises this with the pastoral team', tone: 'warn' },
  { code: 'WRONG_NUMBER', label: 'Wrong number', tone: 'warn' },
];

const toneClasses: Record<'good' | 'neutral' | 'warn', string> = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400',
  neutral: 'border-slate-200 bg-white text-slate-800 hover:border-slate-400',
  warn: 'border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-400',
};

interface LogContactDialogProps {
  memberId: string;
  memberName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function LogContactDialog({ memberId, memberName, isOpen, onClose }: LogContactDialogProps) {
  const [outcome, setOutcome] = useState<ContactOutcome | null>(null);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  function reset() {
    setOutcome(null);
    setNotes('');
  }

  const mutation = useMutation({
    mutationFn: () => logContact(memberId, { channel: 'CALL', outcome: outcome!, notes: notes.trim() || undefined }),
    onSuccess: () => {
      // My People sorts on last contact, so it has to be re-read, not patched.
      void queryClient.invalidateQueries({ queryKey: ['my-people'] });
      void queryClient.invalidateQueries({ queryKey: ['member-contacts', memberId] });
      toast({ title: 'Saved', description: `Your note about ${memberName} was recorded.`, variant: 'success' });
      reset();
      onClose();
    },
    onError: () => {
      toast({ title: 'Not saved', description: 'Please try again in a moment.', variant: 'error' });
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title={`How did it go with ${memberName}?`}
      size="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {OUTCOMES.map((o) => (
            <button
              key={o.code}
              type="button"
              onClick={() => setOutcome(o.code)}
              aria-pressed={outcome === o.code}
              className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${
                outcome === o.code ? 'border-indigo-600 ring-2 ring-indigo-200' : toneClasses[o.tone]
              }`}
            >
              {o.label}
              {o.hint && <span className="mt-0.5 block text-xs font-normal opacity-70">{o.hint}</span>}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="contact-notes" className="mb-1 block text-sm font-medium text-slate-700">
            Anything to remember? <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <Textarea
            id="contact-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Travelling until the 20th, will come the Sunday after."
            maxLength={2000}
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="secondary"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={!outcome || mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
