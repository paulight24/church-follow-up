import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Trash2, BarChart3, ShieldCheck, Send, Ban, CalendarClock, FileCheck, Printer, Pencil, ImageIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { DatePicker } from '@/components/ui/DatePicker';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { formatDate } from '@/lib/formatters';
import { encouragementsApi, mediaAssetUrl } from '../api/encouragements.api';
import { EditEncouragementModal } from '../components/EditEncouragementModal';
import type { Encouragement } from '@/types/encouragement';

const PAGE_SIZE = 10;

// Mirrors the backend's edit guard (encouragements.service.ts#updateEncouragement):
// SENDING/SENT/CANCELLED messages can no longer be edited.
const EDITABLE_STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED'];

const statusOptions = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Pending Approval', value: 'PENDING_APPROVAL' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Sending', value: 'SENDING' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export function EncouragementListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const canCreate = usePermission('encouragements.create');
  const canApprove = usePermission('encouragements.approve');
  const canSend = usePermission('encouragements.send');
  const canUpdate = usePermission('encouragements.update');
  const canDelete = usePermission('encouragements.delete');

  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [pendingSendId, setPendingSendId] = useState<string | null>(null);
  const [scheduleTargetId, setScheduleTargetId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Encouragement | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['encouragements', { status, page }],
    queryFn: () =>
      encouragementsApi
        .getEncouragements({ status: status || undefined, page, pageSize: PAGE_SIZE })
        .then((res) => res.data),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['encouragements'] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => encouragementsApi.deleteEncouragement(id),
    onSuccess: () => {
      toast({ title: 'Encouragement deleted', variant: 'success' });
      invalidate();
    },
    onError: (error: any) => toast({ title: 'Could not delete', description: error?.response?.data?.message, variant: 'error' }),
  });

  const submitMutation = useMutation({
    mutationFn: (id: string) => encouragementsApi.submitForApproval(id),
    onSuccess: () => {
      toast({ title: 'Submitted for approval', variant: 'success' });
      invalidate();
    },
    onError: (error: any) => toast({ title: 'Could not submit', description: error?.response?.data?.message, variant: 'error' }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => encouragementsApi.approveEncouragement(id),
    onSuccess: () => {
      toast({ title: 'Encouragement approved', variant: 'success' });
      invalidate();
    },
    onError: (error: any) => toast({ title: 'Could not approve', description: error?.response?.data?.message, variant: 'error' }),
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => encouragementsApi.sendEncouragementNow(id),
    onSuccess: (res) => {
      toast({
        title: 'Encouragement sent',
        description: `Delivered to ${res.data.sent} recipient(s)${res.data.skipped ? `, ${res.data.skipped} skipped` : ''}.`,
        variant: 'success',
      });
      invalidate();
    },
    onError: (error: any) => toast({ title: 'Could not send', description: error?.response?.data?.message, variant: 'error' }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => encouragementsApi.cancelEncouragement(id),
    onSuccess: () => {
      toast({ title: 'Encouragement cancelled', variant: 'success' });
      invalidate();
    },
    onError: (error: any) => toast({ title: 'Could not cancel', description: error?.response?.data?.message, variant: 'error' }),
  });

  const scheduleMutation = useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) =>
      encouragementsApi.scheduleEncouragement(id, scheduledAt),
    onSuccess: () => {
      toast({ title: 'Encouragement scheduled', variant: 'success' });
      invalidate();
      setScheduleTargetId(null);
      setScheduleDate('');
    },
    onError: (error: any) => toast({ title: 'Could not schedule', description: error?.response?.data?.message, variant: 'error' }),
  });

  const { data: detail } = useQuery({
    queryKey: ['encouragements', detailId, 'analytics'],
    queryFn: () => encouragementsApi.getAnalytics(detailId as string).then((res) => res.data),
    enabled: Boolean(detailId),
  });

  const encouragements = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Encouragements"
        subtitle="Send uplifting messages and scripture to your congregation"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/encouragements/cards">
              <Button variant="outline" leftIcon={<Printer className="h-4 w-4" />}>
                Print Cards
              </Button>
            </Link>
            <Button onClick={() => navigate('/encouragements/new')} leftIcon={<Heart className="h-4 w-4" />}>
              Send New
            </Button>
          </div>
        }
      />

      <Card>
        <div className="flex items-center gap-3 border-b border-slate-100 p-4 sm:p-6">
          <div className="w-56">
            <Select
              placeholder="All statuses"
              options={statusOptions}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-rose-600">Could not load encouragements.</p>
        ) : encouragements.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No encouragements yet"
            description="Send your first encouragement message to the congregation."
            action={
              canCreate ? (
                <Button leftIcon={<Heart className="h-4 w-4" />} onClick={() => navigate('/encouragements/new')}>
                  Send New
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Scripture</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {encouragements.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.imageAsset ? (
                          <img
                            src={mediaAssetUrl(item.imageAsset)}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded object-cover"
                          />
                        ) : (
                          item.messageType === 'IMAGE' && <ImageIcon className="h-4 w-4 shrink-0 text-slate-300" />
                        )}
                        <span className="font-medium text-slate-900">{item.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-600">{item.scriptureReference ?? '-'}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} type="campaign" />
                    </TableCell>
                    <TableCell>{(item._count?.recipients ?? 0).toLocaleString()}</TableCell>
                    <TableCell>
                      {item.createdBy ? `${item.createdBy.firstName} ${item.createdBy.lastName}` : '—'}
                    </TableCell>
                    <TableCell>{item.sentAt ? formatDate(item.sentAt) : formatDate(item.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<BarChart3 className="h-3.5 w-3.5" />}
                          onClick={() => setDetailId(item.id)}
                        >
                          View
                        </Button>

                        {EDITABLE_STATUSES.includes(item.status) && canUpdate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Pencil className="h-3.5 w-3.5" />}
                            onClick={() => setEditTarget(item)}
                          >
                            Edit
                          </Button>
                        )}

                        {item.status === 'DRAFT' && canCreate && !item.sendAsPastor && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FileCheck className="h-3.5 w-3.5" />}
                            onClick={() => submitMutation.mutate(item.id)}
                          >
                            Submit
                          </Button>
                        )}

                        {['DRAFT', 'PENDING_APPROVAL'].includes(item.status) && canApprove && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<ShieldCheck className="h-3.5 w-3.5" />}
                            onClick={() => approveMutation.mutate(item.id)}
                          >
                            Approve
                          </Button>
                        )}

                        {['DRAFT', 'APPROVED', 'SCHEDULED'].includes(item.status) && canSend && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Send className="h-3.5 w-3.5" />}
                            onClick={() => setPendingSendId(item.id)}
                          >
                            Send
                          </Button>
                        )}

                        {['DRAFT', 'APPROVED'].includes(item.status) && canSend && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<CalendarClock className="h-3.5 w-3.5" />}
                            onClick={() => setScheduleTargetId(item.id)}
                          >
                            Schedule
                          </Button>
                        )}

                        {!['SENT', 'CANCELLED'].includes(item.status) && canUpdate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Ban className="h-3.5 w-3.5" />}
                            onClick={() => setPendingCancelId(item.id)}
                          >
                            Cancel
                          </Button>
                        )}

                        {['DRAFT', 'CANCELLED'].includes(item.status) && canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                            onClick={() => setPendingDeleteId(item.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {meta && meta.totalPages > 1 && (
              <div className="border-t border-slate-100 px-4 py-4 sm:px-6">
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={setPage}
                  totalItems={meta.total}
                  pageSize={meta.limit}
                />
              </div>
            )}
          </>
        )}
      </Card>

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => pendingDeleteId && deleteMutation.mutate(pendingDeleteId)}
        title="Delete encouragement"
        message="This will permanently delete this draft/cancelled message."
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={pendingCancelId !== null}
        onClose={() => setPendingCancelId(null)}
        onConfirm={() => pendingCancelId && cancelMutation.mutate(pendingCancelId)}
        title="Cancel encouragement"
        message="This will cancel the message before it is dispatched."
        confirmText="Cancel Message"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={pendingSendId !== null}
        onClose={() => setPendingSendId(null)}
        onConfirm={() => pendingSendId && sendMutation.mutate(pendingSendId)}
        title="Send now"
        message="This will immediately dispatch the message to every eligible recipient based on their preferences and consent."
        confirmText="Send Now"
        variant="warning"
      />

      <Modal
        isOpen={scheduleTargetId !== null}
        onClose={() => setScheduleTargetId(null)}
        title="Schedule Encouragement"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setScheduleTargetId(null)}>
              Cancel
            </Button>
            <Button
              isLoading={scheduleMutation.isPending}
              disabled={!scheduleDate}
              onClick={() =>
                scheduleTargetId &&
                scheduleMutation.mutate({
                  id: scheduleTargetId,
                  scheduledAt: new Date(`${scheduleDate}T08:00:00`).toISOString(),
                })
              }
            >
              Schedule
            </Button>
          </div>
        }
      >
        <DatePicker
          label="Scheduled Date"
          value={scheduleDate}
          onChange={setScheduleDate}
          min={new Date().toISOString().split('T')[0]}
          helpText="The message will be sent at 8:00 AM on the selected date"
        />
      </Modal>

      <Modal isOpen={detailId !== null} onClose={() => setDetailId(null)} title="Encouragement Analytics" size="lg">
        {detail ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-200 p-3 text-center">
                <p className="text-xl font-bold text-slate-900">{detail.totalRecipients}</p>
                <p className="text-xs text-slate-500">Recipients</p>
              </div>
              {Object.entries(detail.byStatus).map(([key, val]) => (
                <div key={key} className="rounded-lg border border-slate-200 p-3 text-center">
                  <p className="text-xl font-bold text-slate-900">{val}</p>
                  <p className="text-xs text-slate-500">{key}</p>
                </div>
              ))}
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">By Channel</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(detail.byChannel).length === 0 && (
                  <p className="text-sm text-slate-500">No recipients yet.</p>
                )}
                {Object.entries(detail.byChannel).map(([channel, count]) => (
                  <span key={channel} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {channel}: {count}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">Responses</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(detail.responses).length === 0 && (
                  <p className="text-sm text-slate-500">No responses yet.</p>
                )}
                {Object.entries(detail.responses).map(([type, count]) => (
                  <span key={type} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                    {type}: {count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <Spinner className="text-indigo-600" />
          </div>
        )}
      </Modal>

      {editTarget && <EditEncouragementModal encouragement={editTarget} onClose={() => setEditTarget(null)} />}
    </div>
  );
}
