import { Plus, Eye, Pencil } from 'lucide-react';
import type { Campaign } from '@/types/campaign';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card } from '@/components/ui/Card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { formatDate } from '@/lib/formatters';

const channelBadgeVariant: Record<string, 'info' | 'success' | 'purple'> = {
  SMS: 'info',
  WHATSAPP: 'success',
  EMAIL: 'purple',
};

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Easter Sunday Reminder',
    subject: 'Join Us This Easter Sunday!',
    content: '<p>He is risen! Join us for a special Easter celebration.</p>',
    channel: 'EMAIL',
    status: 'SENT',
    scheduledAt: '2026-04-05T07:00:00Z',
    sentAt: '2026-04-05T07:00:00Z',
    recipientCount: 1247,
    deliveredCount: 1198,
    openedCount: 876,
    failedCount: 49,
    createdById: 'u1',
    createdBy: { id: 'u1', firstName: 'Pastor', lastName: 'James' },
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-04-05T07:01:00Z',
  },
  {
    id: '2',
    name: 'New Members Welcome',
    subject: null,
    content: 'Welcome to our church family! We are glad to have you.',
    channel: 'SMS',
    status: 'SENT',
    scheduledAt: null,
    sentAt: '2026-07-10T14:30:00Z',
    recipientCount: 34,
    deliveredCount: 32,
    openedCount: 28,
    failedCount: 2,
    createdById: 'u2',
    createdBy: { id: 'u2', firstName: 'Sarah', lastName: 'Williams' },
    createdAt: '2026-07-10T14:00:00Z',
    updatedAt: '2026-07-10T14:31:00Z',
  },
  {
    id: '3',
    name: 'Midweek Service Update',
    subject: null,
    content: 'Reminder: Midweek service has been moved to Thursday this week.',
    channel: 'WHATSAPP',
    status: 'SCHEDULED',
    scheduledAt: '2026-07-30T08:00:00Z',
    sentAt: null,
    recipientCount: 890,
    deliveredCount: 0,
    openedCount: 0,
    failedCount: 0,
    createdById: 'u1',
    createdBy: { id: 'u1', firstName: 'Pastor', lastName: 'James' },
    createdAt: '2026-07-24T09:00:00Z',
    updatedAt: '2026-07-24T09:00:00Z',
  },
  {
    id: '4',
    name: 'Prayer Meeting Invitation',
    subject: 'You Are Invited to Our Prayer Meeting',
    content: '<p>Join us for a powerful time of prayer and intercession.</p>',
    channel: 'EMAIL',
    status: 'DRAFT',
    scheduledAt: null,
    sentAt: null,
    recipientCount: 0,
    deliveredCount: 0,
    openedCount: 0,
    failedCount: 0,
    createdById: 'u3',
    createdBy: { id: 'u3', firstName: 'Michael', lastName: 'Adeyemi' },
    createdAt: '2026-07-22T16:00:00Z',
    updatedAt: '2026-07-23T11:00:00Z',
  },
  {
    id: '5',
    name: 'End of Year Thanksgiving',
    subject: null,
    content: 'Save the date for our annual thanksgiving and praise night!',
    channel: 'SMS',
    status: 'DRAFT',
    scheduledAt: null,
    sentAt: null,
    recipientCount: 0,
    deliveredCount: 0,
    openedCount: 0,
    failedCount: 0,
    createdById: 'u2',
    createdBy: { id: 'u2', firstName: 'Sarah', lastName: 'Williams' },
    createdAt: '2026-07-20T12:00:00Z',
    updatedAt: '2026-07-20T12:00:00Z',
  },
];

export function CampaignListPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        subtitle="Create and manage outreach campaigns"
        actions={
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => alert('Navigate to campaign builder')}
          >
            New Campaign
          </Button>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCampaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <span className="font-medium text-slate-900">
                    {campaign.name}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={channelBadgeVariant[campaign.channel] ?? 'gray'}>
                    {campaign.channel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={campaign.status} type="campaign" />
                </TableCell>
                <TableCell>
                  {campaign.recipientCount.toLocaleString()}
                </TableCell>
                <TableCell>
                  {campaign.deliveredCount.toLocaleString()}
                </TableCell>
                <TableCell>
                  {campaign.openedCount.toLocaleString()}
                </TableCell>
                <TableCell>
                  {formatDate(campaign.sentAt ?? campaign.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Eye className="h-3.5 w-3.5" />}
                      onClick={() => alert(`View campaign: ${campaign.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Pencil className="h-3.5 w-3.5" />}
                      onClick={() => alert(`Edit campaign: ${campaign.id}`)}
                    >
                      Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
