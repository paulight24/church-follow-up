import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart3, ShieldCheck, Send, CalendarClock, Ban } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DatePicker } from '@/components/ui/DatePicker';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from '@/components/ui/Table';
import { formatDateTime } from '@/lib/formatters';
import { campaignsApi } from '../api/campaigns.api';

const STAT_LABELS: Array<{ key: string; label: string }> = [
  { key: 'SENT', label: 'Sent' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'OPENED', label: 'Opened' },
  { key: 'CLICKED', label: 'Clicked' },
  { key: 'BOUNCED', label: 'Bounced' },
  { key: 'UNSUBSCRIBED', label: 'Unsubscribed' },
  { key: 'FAILED', label: 'Failed' },
];

export function CampaignAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const canApprove = usePermission('campaigns.approve');
  const canSend = usePermission('campaigns.send');
  const canUpdate = usePermission('campaigns.update');

  const [scheduledDate, setScheduledDate] = useState('');
  const [confirmAction, setConfirmAction] = useState<'send' | 'cancel' | null>(null);

  const { data: campaign, isLoading: isLoadingCampaign } = useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => campaignsApi.getCampaign(id as string).then((res) => res.data),
    enabled: Boolean(id),
  });

  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['campaigns', id, 'analytics'],
    queryFn: () => campaignsApi.getAnalytics(id as string).then((res) => res.data),
    enabled: Boolean(id),
    refetchInterval: campaign && ['SENDING'].includes(campaign.status) ? 5000 : false,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['campaigns', id] });
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
  };

  const approveMutation = useMutation({
    mutationFn: () => campaignsApi.approveCampaign(id as string),
    onSuccess: () => {
      toast({ title: 'Campaign approved', variant: 'success' });
      invalidate();
    },
    onError: (error: any) =>
      toast({ title: 'Could not approve', description: error?.response?.data?.message, variant: 'error' }),
  });

  const sendMutation = useMutation({
    mutationFn: () => campaignsApi.sendCampaign(id as string),
    onSuccess: () => {
      toast({ title: 'Campaign sent', variant: 'success' });
      invalidate();
    },
    onError: (error: any) =>
      toast({ title: 'Could not send campaign', description: error?.response?.data?.message, variant: 'error' }),
  });

  const scheduleMutation = useMutation({
    mutationFn: () => campaignsApi.scheduleCampaign(id as string, new Date(scheduledDate).toISOString()),
    onSuccess: () => {
      toast({ title: 'Campaign scheduled', variant: 'success' });
      invalidate();
    },
    onError: (error: any) =>
      toast({ title: 'Could not schedule campaign', description: error?.response?.data?.message, variant: 'error' }),
  });

  const cancelMutation = useMutation({
    mutationFn: () => campaignsApi.cancelCampaign(id as string),
    onSuccess: () => {
      toast({ title: 'Campaign cancelled', variant: 'success' });
      invalidate();
    },
    onError: (error: any) =>
      toast({ title: 'Could not cancel campaign', description: error?.response?.data?.message, variant: 'error' }),
  });

  if (isLoadingCampaign || !id) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-6">
        <PageHeader title="Campaign not found" />
        <Button variant="outline" onClick={() => navigate('/campaigns')}>
          Back to Campaigns
        </Button>
      </div>
    );
  }

  const isApproved = Boolean(campaign.approvedById);
  const canDispatch = ['DRAFT', 'SCHEDULED'].includes(campaign.status);
  const canCancel = !['SENT', 'CANCELLED'].includes(campaign.status);
  const recipients = campaign.recipients ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={campaign.name}
        subtitle={campaign.subject}
        breadcrumbs={[{ label: 'Campaigns', href: '/campaigns' }, { label: campaign.name }]}
        actions={<StatusBadge status={campaign.status} type="campaign" />}
      />

      {canDispatch && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 py-4">
            {!isApproved && canApprove && (
              <Button
                variant="outline"
                leftIcon={<ShieldCheck className="h-4 w-4" />}
                isLoading={approveMutation.isPending}
                onClick={() => approveMutation.mutate()}
              >
                Approve
              </Button>
            )}
            {isApproved && canSend && (
              <Button
                leftIcon={<Send className="h-4 w-4" />}
                isLoading={sendMutation.isPending}
                onClick={() => setConfirmAction('send')}
              >
                Send Now
              </Button>
            )}
            {isApproved && canSend && (
              <div className="flex items-center gap-2">
                <DatePicker value={scheduledDate} onChange={setScheduledDate} />
                <Button
                  variant="outline"
                  leftIcon={<CalendarClock className="h-4 w-4" />}
                  isLoading={scheduleMutation.isPending}
                  disabled={!scheduledDate}
                  onClick={() => scheduleMutation.mutate()}
                >
                  Schedule
                </Button>
              </div>
            )}
            {!isApproved && (
              <p className="text-sm text-slate-500">
                This campaign must be approved before it can be scheduled or sent.
              </p>
            )}
            {canCancel && canUpdate && (
              <Button
                variant="ghost"
                className="ml-auto text-rose-600 hover:bg-rose-50"
                leftIcon={<Ban className="h-4 w-4" />}
                onClick={() => setConfirmAction('cancel')}
              >
                Cancel Campaign
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAnalytics ? (
            <div className="flex justify-center py-8">
              <Spinner className="text-indigo-600" />
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-200 p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">{analytics.totalRecipients.toLocaleString()}</p>
                <p className="mt-1 text-xs text-slate-500">Total Recipients</p>
              </div>
              {STAT_LABELS.map((stat) => (
                <div key={stat.key} className="rounded-lg border border-slate-200 p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {(analytics as unknown as Record<string, number>)[stat.key]?.toLocaleString() ?? 0}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 text-center">
              <BarChart3 className="h-16 w-16 text-slate-300" />
              <p className="mt-4 text-sm text-slate-500">Analytics will appear once this campaign has recipients.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recipients</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Opened</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipients.length === 0 ? (
              <TableEmpty colSpan={5} message="No recipients yet - they're generated when the campaign sends." />
            ) : (
              recipients.map((recipient) => (
                <TableRow key={recipient.id}>
                  <TableCell>
                    {recipient.member.firstName} {recipient.member.lastName}
                  </TableCell>
                  <TableCell>{recipient.email ?? recipient.member.email ?? '—'}</TableCell>
                  <TableCell>
                    <StatusBadge status={recipient.status} type="campaign" />
                  </TableCell>
                  <TableCell>{recipient.sentAt ? formatDateTime(recipient.sentAt) : '—'}</TableCell>
                  <TableCell>{recipient.openedAt ? formatDateTime(recipient.openedAt) : '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <ConfirmDialog
        isOpen={confirmAction === 'send'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => sendMutation.mutate()}
        title="Send campaign now"
        message="This will immediately dispatch the campaign to all matching recipients. This cannot be undone."
        confirmText="Send Now"
        variant="warning"
      />
      <ConfirmDialog
        isOpen={confirmAction === 'cancel'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => cancelMutation.mutate()}
        title="Cancel campaign"
        message="This will cancel the campaign. It cannot be resumed afterward."
        confirmText="Cancel Campaign"
        variant="danger"
      />
    </div>
  );
}
