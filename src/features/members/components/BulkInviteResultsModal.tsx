import { CheckCircle2, XCircle, MailX, Link2Off } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import type { Member } from '@/types/member';
import type { BulkInviteOutcome } from '@/features/members/api/invites.api';
import { formatMemberName } from '@/lib/formatters';

interface BulkInviteResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: BulkInviteOutcome[];
  /** So we can show a name/email next to each outcome instead of a bare memberId. */
  memberLookup: Map<string, Member>;
}

const outcomeMeta: Record<
  BulkInviteOutcome['outcome'],
  { label: string; badgeVariant: 'success' | 'warning' | 'danger' | 'gray'; icon: typeof CheckCircle2 }
> = {
  invited: { label: 'Invited', badgeVariant: 'success', icon: CheckCircle2 },
  'skipped-no-email': { label: 'Skipped - no email on file', badgeVariant: 'warning', icon: MailX },
  'skipped-already-linked': { label: 'Skipped - already has a login', badgeVariant: 'gray', icon: Link2Off },
  'skipped-invite-pending': { label: 'Skipped - invite already sent', badgeVariant: 'gray', icon: Link2Off },
  failed: { label: 'Failed', badgeVariant: 'danger', icon: XCircle },
};

/**
 * Deliberately shows every outcome, not just a success count. The whole
 * point of this screen is that "12 invited" must never quietly stand in for
 * "17 selected, 5 of them skipped for reasons you were never told."
 */
export function BulkInviteResultsModal({ isOpen, onClose, results, memberLookup }: BulkInviteResultsModalProps) {
  const invitedCount = results.filter((r) => r.outcome === 'invited').length;
  const skippedCount = results.filter((r) => r.outcome.startsWith('skipped')).length;
  const failedCount = results.filter((r) => r.outcome === 'failed').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite results"
      size="lg"
      footer={
        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-emerald-50 px-3 py-3">
            <p className="text-2xl font-bold text-emerald-700">{invitedCount}</p>
            <p className="text-xs font-medium text-emerald-700">Invited</p>
          </div>
          <div className="rounded-lg bg-amber-50 px-3 py-3">
            <p className="text-2xl font-bold text-amber-700">{skippedCount}</p>
            <p className="text-xs font-medium text-amber-700">Skipped</p>
          </div>
          <div className="rounded-lg bg-rose-50 px-3 py-3">
            <p className="text-2xl font-bold text-rose-700">{failedCount}</p>
            <p className="text-xs font-medium text-rose-700">Failed</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => {
              const member = memberLookup.get(result.memberId);
              const meta = outcomeMeta[result.outcome];
              return (
                <TableRow key={result.memberId}>
                  <TableCell>
                    <p className="font-medium text-slate-900">
                      {member ? formatMemberName(member) : result.memberId}
                    </p>
                    {member?.email && <p className="text-xs text-slate-500">{member.email}</p>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={meta.badgeVariant} size="sm">
                        {meta.label}
                      </Badge>
                    </div>
                    {result.reason && (
                      <p className="mt-1 text-xs text-slate-500">{result.reason}</p>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Modal>
  );
}
