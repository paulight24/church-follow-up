import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Pencil, Trash2, Megaphone } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { formatDate } from '@/lib/formatters';
import { campaignsApi } from '../api/campaigns.api';

const PAGE_SIZE = 10;

const statusOptions = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Sending', value: 'SENDING' },
  { label: 'Sent', value: 'SENT' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Failed', value: 'FAILED' },
];

export function CampaignListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['campaigns', { status, page }],
    queryFn: () =>
      campaignsApi
        .getCampaigns({ status: status || undefined, page, pageSize: PAGE_SIZE })
        .then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignsApi.deleteCampaign(id),
    onSuccess: () => {
      toast({ title: 'Campaign deleted', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Could not delete campaign',
        description: error?.response?.data?.message,
        variant: 'error',
      });
    },
  });

  const campaigns = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        subtitle="Create and manage outreach campaigns"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/campaigns/new')}>
            New Campaign
          </Button>
        }
      />

      <Card>
        <div className="flex items-center gap-3 border-b border-slate-100 p-4 sm:p-6">
          <div className="w-48">
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
          <p className="py-16 text-center text-sm text-rose-600">Could not load campaigns.</p>
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No campaigns yet"
            description="Create your first outreach campaign to get started."
            action={
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => navigate('/campaigns/new')}>
                New Campaign
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <span className="font-medium text-slate-900">{campaign.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-600">{campaign.subject}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={campaign.status} type="campaign" />
                    </TableCell>
                    <TableCell>{(campaign._count?.recipients ?? 0).toLocaleString()}</TableCell>
                    <TableCell>
                      {campaign.createdBy
                        ? `${campaign.createdBy.firstName} ${campaign.createdBy.lastName}`
                        : '—'}
                    </TableCell>
                    <TableCell>{formatDate(campaign.sentAt ?? campaign.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Eye className="h-3.5 w-3.5" />}
                          onClick={() => navigate(`/campaigns/${campaign.id}/analytics`)}
                        >
                          View
                        </Button>
                        {campaign.status === 'DRAFT' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Pencil className="h-3.5 w-3.5" />}
                            onClick={() => navigate(`/campaigns/new?id=${campaign.id}`)}
                          >
                            Edit
                          </Button>
                        )}
                        {['DRAFT', 'CANCELLED', 'FAILED'].includes(campaign.status) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                            onClick={() => setPendingDeleteId(campaign.id)}
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
        onConfirm={() => {
          if (pendingDeleteId) deleteMutation.mutate(pendingDeleteId);
        }}
        title="Delete campaign"
        message="This will permanently delete the campaign. This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
