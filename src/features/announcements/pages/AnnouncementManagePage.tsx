import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EyeOff, Megaphone, Pencil, Pin, Plus, Send, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
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
import { announcementsApi } from '../api/announcements.api';
import { AnnouncementFormModal } from '../components/AnnouncementFormModal';
import { AudienceBadge } from '../components/AudienceBadge';
import type { Announcement, AnnouncementAudience, AnnouncementStatus } from '@/types/announcement';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const AUDIENCE_OPTIONS = [
  { label: 'All audiences', value: '' },
  { label: 'Everyone, including members', value: 'ALL' },
  { label: 'Staff only', value: 'STAFF_ONLY' },
];

function errorMessage(err: unknown, fallback: string): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}

export function AnnouncementManagePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const canUpdate = usePermission('announcements.update');
  const canPublish = usePermission('announcements.publish');
  const canDelete = usePermission('announcements.delete');

  const [status, setStatus] = useState<AnnouncementStatus | ''>('');
  const [audience, setAudience] = useState<AnnouncementAudience | ''>('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingPublishAll, setPendingPublishAll] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['announcements', 'manage', { status, audience, page }],
    queryFn: () =>
      announcementsApi
        .getAnnouncements({ status: status || undefined, audience: audience || undefined, page, pageSize: PAGE_SIZE })
        .then((res) => res.data),
  });

  const announcements = data?.data ?? [];
  const meta = data?.meta;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['announcements'] });

  const publishMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.publishAnnouncement(id),
    onSuccess: () => {
      toast({ title: 'Announcement published', variant: 'success' });
      invalidate();
    },
    onError: (err: unknown) =>
      toast({ title: 'Could not publish', description: errorMessage(err, 'Please try again.'), variant: 'error' }),
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.unpublishAnnouncement(id),
    onSuccess: () => {
      toast({ title: 'Announcement unpublished', variant: 'success' });
      invalidate();
    },
    onError: (err: unknown) =>
      toast({ title: 'Could not unpublish', description: errorMessage(err, 'Please try again.'), variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.deleteAnnouncement(id),
    onSuccess: () => {
      toast({ title: 'Announcement deleted', variant: 'success' });
      invalidate();
    },
    onError: (err: unknown) =>
      toast({ title: 'Could not delete', description: errorMessage(err, 'Please try again.'), variant: 'error' }),
  });

  function handlePublishClick(item: Announcement) {
    // Publishing to the whole congregation is the one action here that's
    // hard to walk back gracefully, so it gets its own explicit confirm;
    // STAFF_ONLY publishes go straight through, same as any other status flip.
    if (item.audience === 'ALL') {
      setPendingPublishAll(item.id);
    } else {
      publishMutation.mutate(item.id);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Announcements"
        subtitle="Author, schedule, and publish announcements for the congregation and staff"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
            New Announcement
          </Button>
        }
      />

      <Card>
        <div className="flex flex-wrap items-end gap-4 border-b border-slate-100 p-4 sm:p-6">
          <div className="w-full sm:w-64">
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as AnnouncementStatus | '');
                setPage(1);
              }}
            />
          </div>
          <div className="w-full sm:w-64">
            <Select
              label="Audience"
              options={AUDIENCE_OPTIONS}
              value={audience}
              onChange={(e) => {
                setAudience(e.target.value as AnnouncementAudience | '');
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
          <p className="py-16 text-center text-sm text-rose-600">Could not load announcements.</p>
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements found"
            description="Create the first announcement for your congregation or staff."
            action={
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
                New Announcement
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Publish window</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.isPinned && <Pin className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                        <span className="font-medium text-slate-900">{item.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <AudienceBadge audience={item.audience} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} type="announcement" />
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-500">
                        <p>From {formatDate(item.publishAt)}</p>
                        <p>{item.expiresAt ? `Until ${formatDate(item.expiresAt)}` : 'No expiry'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.createdBy ? `${item.createdBy.firstName} ${item.createdBy.lastName}` : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Pencil className="h-3.5 w-3.5" />}
                            onClick={() => setEditTarget(item)}
                          >
                            Edit
                          </Button>
                        )}

                        {canPublish && item.status !== 'PUBLISHED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Send className="h-3.5 w-3.5" />}
                            onClick={() => handlePublishClick(item)}
                          >
                            Publish
                          </Button>
                        )}

                        {canPublish && item.status === 'PUBLISHED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<EyeOff className="h-3.5 w-3.5" />}
                            onClick={() => unpublishMutation.mutate(item.id)}
                          >
                            Unpublish
                          </Button>
                        )}

                        {canDelete && (
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

      {(formOpen || editTarget) && (
        <AnnouncementFormModal
          isOpen
          announcement={editTarget}
          onClose={() => {
            setFormOpen(false);
            setEditTarget(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => pendingDeleteId && deleteMutation.mutate(pendingDeleteId)}
        title="Delete announcement"
        message="This will permanently delete this announcement. This cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={pendingPublishAll !== null}
        onClose={() => setPendingPublishAll(null)}
        onConfirm={() => pendingPublishAll && publishMutation.mutate(pendingPublishAll)}
        title="Publish to the whole congregation"
        message="This announcement is set to Everyone, including members. Publishing makes it visible in the public feed and Dashboard for every member the moment its publish window opens. Are you sure?"
        confirmText="Publish to Everyone"
        variant="warning"
      />
    </div>
  );
}
