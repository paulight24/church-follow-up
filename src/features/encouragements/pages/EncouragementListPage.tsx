import { Heart } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { formatDate } from '@/lib/formatters';
import type { Encouragement } from '@/types/encouragement';
import type { CampaignChannel } from '@/types/campaign';

const CHANNEL_BADGE_VARIANT: Record<CampaignChannel, 'info' | 'success' | 'purple'> = {
  SMS: 'info',
  WHATSAPP: 'success',
  EMAIL: 'purple',
};

const mockEncouragements: Encouragement[] = [
  {
    id: '1',
    title: 'Sunday Morning Blessing',
    message: 'May this Sunday bring you peace and renewed strength in the Lord.',
    scriptureReference: 'Psalm 23:1',
    scriptureText: 'The Lord is my shepherd, I lack nothing.',
    channel: 'SMS',
    audience: 'all_members',
    sentById: 'p1',
    sentBy: { id: 'p1', firstName: 'Adebayo', lastName: 'Ogundimu' },
    recipientCount: 450,
    sentAt: '2026-07-20T08:00:00Z',
    createdAt: '2026-07-20T07:45:00Z',
  },
  {
    id: '2',
    title: 'Midweek Prayer Encouragement',
    message: 'Stay strong in prayer this week. God is working behind the scenes.',
    scriptureReference: 'Philippians 4:13',
    scriptureText: 'I can do all things through Christ who strengthens me.',
    channel: 'WHATSAPP',
    audience: 'all_members',
    sentById: 'p2',
    sentBy: { id: 'p2', firstName: 'Chioma', lastName: 'Nwosu' },
    recipientCount: 430,
    sentAt: '2026-07-16T12:00:00Z',
    createdAt: '2026-07-16T11:30:00Z',
  },
  {
    id: '3',
    title: 'Youth Month Special',
    message: 'To our amazing young people: God has incredible plans for your lives!',
    scriptureReference: 'Jeremiah 29:11',
    scriptureText: 'For I know the plans I have for you, declares the Lord.',
    channel: 'EMAIL',
    audience: 'new_members',
    sentById: 'p3',
    sentBy: { id: 'p3', firstName: 'Emeka', lastName: 'Okafor' },
    recipientCount: 85,
    sentAt: '2026-07-10T09:00:00Z',
    createdAt: '2026-07-10T08:30:00Z',
  },
  {
    id: '4',
    title: 'New Year Message',
    message: 'As we step into a new season, may the Lord order your steps and fill your heart with hope.',
    scriptureReference: 'Proverbs 3:5-6',
    scriptureText: 'Trust in the Lord with all your heart and lean not on your own understanding.',
    channel: 'SMS',
    audience: 'all_members',
    sentById: 'p1',
    sentBy: { id: 'p1', firstName: 'Adebayo', lastName: 'Ogundimu' },
    recipientCount: 445,
    sentAt: '2026-01-01T06:00:00Z',
    createdAt: '2025-12-31T22:00:00Z',
  },
  {
    id: '5',
    title: 'Easter Devotional',
    message: 'He is risen! Let the resurrection power of Christ fill you with joy unspeakable.',
    scriptureReference: 'Romans 8:28',
    scriptureText: 'And we know that in all things God works for the good of those who love him.',
    channel: 'WHATSAPP',
    audience: 'all_members',
    sentById: 'p4',
    sentBy: { id: 'p4', firstName: 'Folake', lastName: 'Adeyemi' },
    recipientCount: 440,
    sentAt: '2026-04-05T07:00:00Z',
    createdAt: '2026-04-04T21:00:00Z',
  },
  {
    id: '6',
    title: "Mother's Day Special",
    message: 'To all the wonderful mothers in our church, we celebrate your love, sacrifice, and faithfulness.',
    scriptureReference: 'Isaiah 40:31',
    scriptureText: 'But those who hope in the Lord will renew their strength.',
    channel: 'EMAIL',
    audience: 'custom',
    sentById: 'p2',
    sentBy: { id: 'p2', firstName: 'Chioma', lastName: 'Nwosu' },
    recipientCount: 210,
    sentAt: '2026-05-10T08:00:00Z',
    createdAt: '2026-05-09T20:00:00Z',
  },
];

export function EncouragementListPage() {
  function handleSendNew() {
    alert('Navigate to Send New Encouragement page');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Encouragements"
        subtitle="Send uplifting messages and scripture to your congregation"
        actions={
          <Button
            onClick={handleSendNew}
            leftIcon={<Heart className="h-4 w-4" />}
          >
            Send New
          </Button>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Scripture</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Sent By</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockEncouragements.map((encouragement) => (
              <TableRow key={encouragement.id}>
                <TableCell>
                  <span className="font-medium text-slate-900">
                    {encouragement.title}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-slate-600">
                    {encouragement.scriptureReference ?? '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={CHANNEL_BADGE_VARIANT[encouragement.channel]}>
                    {encouragement.channel}
                  </Badge>
                </TableCell>
                <TableCell>
                  {encouragement.recipientCount.toLocaleString()}
                </TableCell>
                <TableCell>
                  {encouragement.sentBy.firstName} {encouragement.sentBy.lastName}
                </TableCell>
                <TableCell>
                  {encouragement.sentAt
                    ? formatDate(encouragement.sentAt)
                    : 'Draft'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
