import { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Cake,
  Briefcase,
  Clock,
  MessageSquare,
  User,
  AlertTriangle,
} from 'lucide-react';
import type { Member } from '@/types/member';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { formatDate, formatPhone } from '@/lib/formatters';
import { CHANNELS, OUTCOMES } from '@/lib/constants';

interface MemberProfileTabsProps {
  member: Member;
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-900">
          {value || '--'}
        </p>
      </div>
    </div>
  );
}

const mockFollowUpHistory = [
  {
    id: '1',
    date: '2026-07-20',
    worker: 'Ngozi Okafor',
    channel: 'PHONE_CALL',
    outcome: 'REACHED_POSITIVE',
    notes: 'Member is doing well. Attending Sunday services regularly. Expressed interest in joining the choir.',
  },
  {
    id: '2',
    date: '2026-07-13',
    worker: 'Emmanuel Adeyemi',
    channel: 'WHATSAPP',
    outcome: 'REACHED_POSITIVE',
    notes: 'Sent weekly encouragement message. Member responded with gratitude.',
  },
  {
    id: '3',
    date: '2026-07-05',
    worker: 'Ngozi Okafor',
    channel: 'HOME_VISIT',
    outcome: 'REACHED_NEUTRAL',
    notes: 'Visited at home. Member has been traveling for work. Will be back next Sunday.',
  },
  {
    id: '4',
    date: '2026-06-28',
    worker: 'Blessing Eze',
    channel: 'SMS',
    outcome: 'NOT_REACHED',
    notes: 'SMS sent but no response received.',
  },
  {
    id: '5',
    date: '2026-06-15',
    worker: 'Emmanuel Adeyemi',
    channel: 'PHONE_CALL',
    outcome: 'VOICEMAIL',
    notes: 'Left voicemail asking member to return call.',
  },
];

const mockRecentActivity = [
  { id: '1', action: 'Follow-up call completed', date: '2026-07-20T14:30:00Z', type: 'follow-up' },
  { id: '2', action: 'Attended Sunday service', date: '2026-07-20T09:00:00Z', type: 'attendance' },
  { id: '3', action: 'WhatsApp message sent', date: '2026-07-13T11:00:00Z', type: 'communication' },
  { id: '4', action: 'Attended midweek service', date: '2026-07-09T18:30:00Z', type: 'attendance' },
  { id: '5', action: 'Home visit conducted', date: '2026-07-05T16:00:00Z', type: 'follow-up' },
  { id: '6', action: 'Joined Foundation School', date: '2026-06-22T10:00:00Z', type: 'milestone' },
];

function getChannelLabel(value: string) {
  return CHANNELS.find((c) => c.value === value)?.label ?? value;
}

function getOutcomeConfig(value: string) {
  return OUTCOMES.find((o) => o.value === value);
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'follow-up':
      return <Phone className="h-4 w-4" />;
    case 'communication':
      return <MessageSquare className="h-4 w-4" />;
    case 'attendance':
      return <User className="h-4 w-4" />;
    case 'milestone':
      return <CalendarDays className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

export function MemberProfileTabs({ member }: MemberProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const address = [member.address, member.city, member.state, member.zipCode]
    .filter(Boolean)
    .join(', ');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabList className="overflow-x-auto">
        <Tab value="overview">Overview</Tab>
        <Tab value="follow-up">Follow-Up History</Tab>
        <Tab value="attendance">Attendance</Tab>
        <Tab value="communications">Communications</Tab>
        <Tab value="household">Household</Tab>
        <Tab value="escalations">Escalations</Tab>
      </TabList>

      {/* Overview Tab */}
      <TabPanel value="overview">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard
              icon={<Phone className="h-5 w-5" />}
              label="Phone"
              value={member.phone ? formatPhone(member.phone) : null}
            />
            <InfoCard
              icon={<Mail className="h-5 w-5" />}
              label="Email"
              value={member.email}
            />
            <InfoCard
              icon={<MapPin className="h-5 w-5" />}
              label="Address"
              value={address || null}
            />
            <InfoCard
              icon={<CalendarDays className="h-5 w-5" />}
              label="Member Since"
              value={member.joinDate ? formatDate(member.joinDate) : null}
            />
            <InfoCard
              icon={<Cake className="h-5 w-5" />}
              label="Birthday"
              value={member.dateOfBirth ? formatDate(member.dateOfBirth) : null}
            />
            <InfoCard
              icon={<Briefcase className="h-5 w-5" />}
              label="Department"
              value={member.department}
            />
          </div>

          {/* Recent Activity */}
          <Card>
            <CardContent className="pt-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                Recent Activity
              </h3>
              <div className="space-y-0">
                {mockRecentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      {getActivityIcon(activity.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-700">{activity.action}</p>
                    </div>
                    <time className="shrink-0 text-xs text-slate-400">
                      {formatDate(activity.date)}
                    </time>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabPanel>

      {/* Follow-Up History Tab */}
      <TabPanel value="follow-up">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Worker</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockFollowUpHistory.map((record) => {
              const outcomeConfig = getOutcomeConfig(record.outcome);
              return (
                <TableRow key={record.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(record.date)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {record.worker}
                  </TableCell>
                  <TableCell>
                    <Badge variant="gray" size="sm">
                      {getChannelLabel(record.channel)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={outcomeConfig?.label ?? record.outcome}
                      color={outcomeConfig?.color}
                    />
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {record.notes}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TabPanel>

      {/* Attendance Tab */}
      <TabPanel value="attendance">
        <EmptyState
          icon={<CalendarDays className="h-12 w-12" />}
          title="Coming Soon"
          description="Attendance tracking will be available in a future update."
        />
      </TabPanel>

      {/* Communications Tab */}
      <TabPanel value="communications">
        <EmptyState
          icon={<MessageSquare className="h-12 w-12" />}
          title="Coming Soon"
          description="Communication logs will be available in a future update."
        />
      </TabPanel>

      {/* Household Tab */}
      <TabPanel value="household">
        <EmptyState
          icon={<User className="h-12 w-12" />}
          title="Coming Soon"
          description="Household management will be available in a future update."
        />
      </TabPanel>

      {/* Escalations Tab */}
      <TabPanel value="escalations">
        <EmptyState
          icon={<AlertTriangle className="h-12 w-12" />}
          title="Coming Soon"
          description="Escalation tracking will be available in a future update."
        />
      </TabPanel>
    </Tabs>
  );
}
