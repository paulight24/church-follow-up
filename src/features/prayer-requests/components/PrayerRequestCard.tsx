import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart,
  Lock,
  MoreVertical,
  Phone,
  CheckCircle2,
  UserPlus,
  ClipboardPlus,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Dropdown } from '@/components/ui/Dropdown';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import { formatRelativeDate } from '@/lib/formatters';
import { prayerRequestsApi } from '../api/prayer-requests.api';
import type { PrayerRequest, PrayerRequestStatus } from '@/types/prayerRequest';

const STATUS_VARIANT: Record<PrayerRequestStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gray'> = {
  NEW: 'info',
  ASSIGNED: 'default',
  PRAYED: 'success',
  FOLLOW_UP_NEEDED: 'warning',
  TESTIMONY_RECEIVED: 'purple',
  CLOSED: 'gray',
};

function statusLabel(status: PrayerRequestStatus): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function requesterName(request: PrayerRequest): string {
  // The backend strips the requester's identity alongside the text on
  // confidential requests, so there is nothing to show but the lock.
  if (request.requestRedacted) return 'Confidential';
  if (request.member) return `${request.member.firstName} ${request.member.lastName}`;
  if (request.guestFirstName || request.guestLastName) {
    return `${request.guestFirstName ?? ''} ${request.guestLastName ?? ''}`.trim();
  }
  return 'Anonymous';
}

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

interface PrayerRequestCardProps {
  request: PrayerRequest;
  onAssign: (requestId: string) => void;
}

export function PrayerRequestCard({ request, onAssign }: PrayerRequestCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // The route only requires prayer_requests.view to reach this list; each
  // action below needs its own, separate permission on top of that.
  const canMarkPrayed = usePermission('prayer_requests.mark_prayed');
  const canAssign = usePermission('prayer_requests.assign');
  const canUpdate = usePermission('prayer_requests.update');
  const [testimonyModalOpen, setTestimonyModalOpen] = useState(false);
  const [testimonyText, setTestimonyText] = useState('');

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['prayer-requests'] });

  const markPrayedMutation = useMutation({
    mutationFn: () => prayerRequestsApi.markPrayed(request.id),
    onSuccess: () => {
      invalidate();
      toast({ title: 'Marked as prayed', variant: 'success' });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { status: PrayerRequestStatus; testimony?: string }) =>
      prayerRequestsApi.updatePrayerRequest(request.id, data),
    onSuccess: () => {
      invalidate();
      toast({ title: 'Prayer request updated', variant: 'success' });
      setTestimonyModalOpen(false);
      setTestimonyText('');
    },
  });

  const followUpTaskMutation = useMutation({
    mutationFn: () => prayerRequestsApi.createFollowUpTask(request.id),
    onSuccess: () => {
      invalidate();
      toast({ title: 'Follow-up task created', variant: 'success' });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to create follow-up task';
      toast({ title: 'Error', description: message, variant: 'error' });
    },
  });

  const name = requesterName(request);
  const canFollowUp = !!request.memberId && (request.wantsCall || request.wantsPastoralContact);
  // Acting on a request you aren't cleared to read is rejected by the backend
  // too - this just keeps the affordance from showing up at all.
  const isLocked = Boolean(request.requestRedacted);

  const dropdownItems = [
    canAssign && {
      label: request.assignedTo ? 'Reassign' : 'Assign to worker',
      icon: <UserPlus className="h-4 w-4" />,
      onClick: () => onAssign(request.id),
      disabled: isLocked,
    },
    canAssign && {
      label: canFollowUp ? 'Create Follow-Up Task' : 'Create Follow-Up Task (requires linked member + call/pastoral request)',
      icon: <ClipboardPlus className="h-4 w-4" />,
      onClick: () => followUpTaskMutation.mutate(),
      disabled: isLocked || !canFollowUp,
    },
    canUpdate && {
      label: 'Mark Follow-Up Needed',
      icon: <Heart className="h-4 w-4" />,
      onClick: () => updateStatusMutation.mutate({ status: 'FOLLOW_UP_NEEDED' }),
      disabled: isLocked || request.status === 'FOLLOW_UP_NEEDED' || request.status === 'CLOSED',
    },
    canUpdate && {
      label: 'Record Testimony',
      icon: <Sparkles className="h-4 w-4" />,
      onClick: () => setTestimonyModalOpen(true),
      disabled: isLocked || request.status === 'TESTIMONY_RECEIVED',
    },
    canUpdate && {
      label: 'divider',
      onClick: () => {},
      divider: true,
    },
    canUpdate && {
      label: 'Close Request',
      icon: <CheckCircle2 className="h-4 w-4" />,
      onClick: () => updateStatusMutation.mutate({ status: 'CLOSED' }),
      disabled: isLocked || request.status === 'CLOSED',
    },
  ].filter((item): item is Exclude<typeof item, false> => item !== false);

  return (
    <>
      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700">
                {getInitials(name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{name}</p>
                <p className="text-xs text-slate-400">{formatRelativeDate(request.createdAt)}</p>
              </div>
            </div>
            {dropdownItems.length > 0 && (
              <Dropdown
                trigger={
                  <span className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                    <MoreVertical className="h-4 w-4" />
                  </span>
                }
                items={dropdownItems}
              />
            )}
          </div>

          <div className="flex items-start gap-2">
            {request.requestRedacted ? (
              <>
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <p className="text-sm italic text-slate-400">
                  Confidential - only pastoral staff can view this request.
                </p>
              </>
            ) : (
              <>
                <Heart className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                <p className="text-sm text-slate-600">{request.request}</p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {request.category && (
              <Badge variant="default" size="sm">
                {request.category.name}
              </Badge>
            )}
            {request.confidentialityLevel !== 'STANDARD' && (
              <Badge variant="danger" size="sm">
                {request.confidentialityLevel === 'PASTOR_ONLY' ? 'Pastor Only' : 'Confidential'}
              </Badge>
            )}
            {request.wantsCall && (
              <Badge variant="info" size="sm">
                <Phone className="h-3 w-3" /> Wants Call
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="min-w-0">
              <Badge variant={STATUS_VARIANT[request.status]} dot>
                {statusLabel(request.status)}
              </Badge>
              {request.assignedTo && (
                <p className="mt-1 truncate text-xs text-slate-400">
                  Assigned: {request.assignedTo.firstName} {request.assignedTo.lastName}
                </p>
              )}
            </div>
            {canMarkPrayed && request.status !== 'PRAYED' && request.status !== 'CLOSED' && (
              <Button
                variant="outline"
                size="sm"
                isLoading={markPrayedMutation.isPending}
                onClick={() => markPrayedMutation.mutate()}
              >
                Mark Prayed
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={testimonyModalOpen}
        onClose={() => setTestimonyModalOpen(false)}
        title="Record Testimony"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setTestimonyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={updateStatusMutation.isPending}
              onClick={() => updateStatusMutation.mutate({ status: 'TESTIMONY_RECEIVED', testimony: testimonyText })}
            >
              Save Testimony
            </Button>
          </div>
        }
      >
        <Textarea
          label={`Testimony for ${name}`}
          value={testimonyText}
          onChange={(e) => setTestimonyText(e.target.value)}
          rows={4}
          placeholder="Share how God answered this prayer..."
        />
      </Modal>
    </>
  );
}
