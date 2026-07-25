import { useState } from 'react';
import { Plus, Heart } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs';

interface PrayerRequest {
  id: string;
  name: string;
  request: string;
  status: 'active' | 'answered';
  timeAgo: string;
}

const mockRequests: PrayerRequest[] = [
  {
    id: '1',
    name: 'Mrs. Adebayo Folake',
    request: 'Praying for healing from surgery',
    status: 'active',
    timeAgo: '3 days ago',
  },
  {
    id: '2',
    name: 'Brother Chukwuma Obi',
    request: 'Prayer for job interview this Friday',
    status: 'active',
    timeAgo: '1 day ago',
  },
  {
    id: '3',
    name: 'Sister Grace Nwosu',
    request: 'Thanksgiving for safe delivery of baby',
    status: 'answered',
    timeAgo: '1 week ago',
  },
  {
    id: '4',
    name: 'Deacon Emeka Okafor',
    request: 'Prayer for family unity and peace',
    status: 'active',
    timeAgo: '5 days ago',
  },
  {
    id: '5',
    name: 'Mrs. Ngozi Eze',
    request: 'Healing prayer for mother\'s health',
    status: 'active',
    timeAgo: '2 days ago',
  },
  {
    id: '6',
    name: 'Anonymous',
    request: 'Prayer for direction and guidance in career',
    status: 'answered',
    timeAgo: '2 weeks ago',
  },
];

function getInitials(name: string): string {
  if (name === 'Anonymous') return '?';
  return name
    .split(' ')
    .filter((part) => !['Mrs.', 'Mr.', 'Dr.', 'Brother', 'Sister', 'Deacon', 'Pastor'].includes(part))
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function PrayerRequestListPage() {
  const [activeTab, setActiveTab] = useState('all');

  const filteredRequests = mockRequests.filter((request) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return request.status === 'active';
    if (activeTab === 'answered') return request.status === 'answered';
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prayer Requests"
        actions={
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            New Request
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabList>
          <Tab value="all">All</Tab>
          <Tab value="active">Active</Tab>
          <Tab value="answered">Answered</Tab>
        </TabList>

        <TabPanel value="all">
          <RequestGrid requests={filteredRequests} />
        </TabPanel>
        <TabPanel value="active">
          <RequestGrid requests={filteredRequests} />
        </TabPanel>
        <TabPanel value="answered">
          <RequestGrid requests={filteredRequests} />
        </TabPanel>
      </Tabs>
    </div>
  );
}

function RequestGrid({ requests }: { requests: PrayerRequest[] }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700">
                {getInitials(request.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {request.name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Heart className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              <p className="text-sm text-slate-600">{request.request}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{request.timeAgo}</span>
              <StatusBadge
                variant={request.status === 'active' ? 'success' : 'info'}
                dot
              >
                {request.status === 'active' ? 'Active' : 'Answered'}
              </StatusBadge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
