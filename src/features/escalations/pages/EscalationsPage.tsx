import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { Escalation } from '@/types/escalation';
import { ESCALATION_TYPES, ESCALATION_PRIORITY } from '@/lib/constants';
import { formatDate } from '@/lib/formatters';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabList, Tab } from '@/components/ui/Tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { EscalationForm } from '../components/EscalationForm';

const MOCK_ESCALATIONS: Escalation[] = [
  {
    id: '1',
    memberId: 'm1',
    member: { id: 'm1', firstName: 'Chioma', lastName: 'Okafor', phone: '+234 803 456 7890', email: 'chioma.okafor@email.com' },
    reportedById: 'r1',
    reportedBy: { id: 'r1', firstName: 'Adaeze', lastName: 'Nwosu' },
    type: 'CRISIS',
    priority: 'CRITICAL',
    status: 'OPEN',
    title: 'Family emergency - urgent pastoral care needed',
    description: 'Member is going through a severe family crisis and needs immediate pastoral intervention.',
    confidentialNotes: 'Husband lost his job last month. Financial pressure is significant.',
    createdAt: '2026-07-23T09:30:00Z',
    updatedAt: '2026-07-23T09:30:00Z',
  },
  {
    id: '2',
    memberId: 'm2',
    member: { id: 'm2', firstName: 'Emeka', lastName: 'Eze', phone: '+234 706 123 4567', email: 'emeka.eze@email.com' },
    reportedById: 'r2',
    reportedBy: { id: 'r2', firstName: 'Tunde', lastName: 'Adeyemi' },
    type: 'MEDICAL',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    title: 'Hospitalized after surgery - needs visitation',
    description: 'Brother Emeka had an emergency surgery and is currently admitted at the hospital.',
    assignedToId: 'a1',
    assignedTo: { id: 'a1', firstName: 'Pastor', lastName: 'James' },
    createdAt: '2026-07-21T14:00:00Z',
    updatedAt: '2026-07-22T10:00:00Z',
  },
  {
    id: '3',
    memberId: 'm3',
    member: { id: 'm3', firstName: 'Ngozi', lastName: 'Adeyinka', phone: '+234 812 345 6789', email: null },
    reportedById: 'r3',
    reportedBy: { id: 'r3', firstName: 'Folake', lastName: 'Balogun' },
    type: 'SPIRITUAL_DISTRESS',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    title: 'Struggling with faith - requested counseling',
    description: 'Sister Ngozi has been absent from services and expressed doubts during a follow-up call.',
    assignedToId: 'a2',
    assignedTo: { id: 'a2', firstName: 'Deaconess', lastName: 'Grace' },
    createdAt: '2026-07-20T08:15:00Z',
    updatedAt: '2026-07-21T16:30:00Z',
  },
  {
    id: '4',
    memberId: 'm4',
    member: { id: 'm4', firstName: 'Obinna', lastName: 'Chukwu', phone: '+234 907 654 3210', email: 'obinna.chukwu@email.com' },
    reportedById: 'r1',
    reportedBy: { id: 'r1', firstName: 'Adaeze', lastName: 'Nwosu' },
    type: 'FINANCIAL',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    title: 'Unable to pay rent - needs welfare assistance',
    description: 'Brother Obinna lost his source of income and is unable to meet rent obligations.',
    assignedToId: 'a3',
    assignedTo: { id: 'a3', firstName: 'Elder', lastName: 'Solomon' },
    resolvedAt: '2026-07-19T11:00:00Z',
    resolvedById: 'a3',
    resolvedBy: { id: 'a3', firstName: 'Elder', lastName: 'Solomon' },
    resolutionNotes: 'Welfare fund disbursed. Member connected with job placement program.',
    createdAt: '2026-07-15T10:00:00Z',
    updatedAt: '2026-07-19T11:00:00Z',
  },
  {
    id: '5',
    memberId: 'm5',
    member: { id: 'm5', firstName: 'Amaka', lastName: 'Obi', phone: '+234 815 987 6543', email: 'amaka.obi@email.com' },
    reportedById: 'r4',
    reportedBy: { id: 'r4', firstName: 'Blessing', lastName: 'Udo' },
    type: 'PRAYER_REQUEST',
    priority: 'LOW',
    status: 'OPEN',
    title: 'Prayer needed for upcoming medical procedure',
    description: 'Sister Amaka is scheduled for a medical procedure next week and requests prayer support.',
    createdAt: '2026-07-24T07:45:00Z',
    updatedAt: '2026-07-24T07:45:00Z',
  },
  {
    id: '6',
    memberId: 'm6',
    member: { id: 'm6', firstName: 'Yusuf', lastName: 'Ibrahim', phone: '+234 802 111 2233', email: null },
    reportedById: 'r2',
    reportedBy: { id: 'r2', firstName: 'Tunde', lastName: 'Adeyemi' },
    type: 'PASTORAL_NEED',
    priority: 'HIGH',
    status: 'CLOSED',
    title: 'Marriage counseling follow-up completed',
    description: 'Brother Yusuf and his wife completed the pastoral counseling sessions.',
    assignedToId: 'a4',
    assignedTo: { id: 'a4', firstName: 'Pastor', lastName: 'David' },
    resolvedAt: '2026-07-10T15:00:00Z',
    resolvedById: 'a4',
    resolvedBy: { id: 'a4', firstName: 'Pastor', lastName: 'David' },
    resolutionNotes: 'Couple completed 6 sessions. Significant improvement noted.',
    createdAt: '2026-06-28T09:00:00Z',
    updatedAt: '2026-07-10T15:00:00Z',
  },
];

type TabValue = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

function getTypeLabel(value: string): string {
  return ESCALATION_TYPES.find((t) => t.value === value)?.label ?? value;
}

function getPriorityBadgeVariant(value: string) {
  const map: Record<string, 'gray' | 'warning' | 'danger' | 'info'> = {
    LOW: 'gray',
    MEDIUM: 'warning',
    HIGH: 'danger',
    CRITICAL: 'danger',
  };
  return map[value] ?? 'gray';
}

function getPriorityLabel(value: string): string {
  return ESCALATION_PRIORITY.find((p) => p.value === value)?.label ?? value;
}

export function EscalationsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredEscalations =
    activeTab === 'ALL'
      ? MOCK_ESCALATIONS
      : MOCK_ESCALATIONS.filter((e) => e.status === activeTab);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Escalations"
        subtitle="Track and manage pastoral care escalations"
        actions={
          <Button
            leftIcon={<AlertTriangle className="h-4 w-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Report Escalation
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabList>
          <Tab value="ALL">
            All ({MOCK_ESCALATIONS.length})
          </Tab>
          <Tab value="OPEN">
            Open ({MOCK_ESCALATIONS.filter((e) => e.status === 'OPEN').length})
          </Tab>
          <Tab value="IN_PROGRESS">
            In Progress ({MOCK_ESCALATIONS.filter((e) => e.status === 'IN_PROGRESS').length})
          </Tab>
          <Tab value="RESOLVED">
            Resolved ({MOCK_ESCALATIONS.filter((e) => e.status === 'RESOLVED').length})
          </Tab>
        </TabList>
      </Tabs>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Reported By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEscalations.map((escalation) => (
            <TableRow key={escalation.id}>
              <TableCell>
                <span className="font-medium text-slate-900">
                  {escalation.member.firstName} {escalation.member.lastName}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="default" size="sm">
                  {getTypeLabel(escalation.type)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getPriorityBadgeVariant(escalation.priority)} size="sm">
                  {getPriorityLabel(escalation.priority)}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="max-w-xs truncate block">
                  {escalation.title}
                </span>
              </TableCell>
              <TableCell>
                {escalation.reportedBy.firstName} {escalation.reportedBy.lastName}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDate(escalation.createdAt)}
              </TableCell>
              <TableCell>
                <StatusBadge status={escalation.status} type="escalation" />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alert('Viewing escalation')}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Report Escalation"
        size="lg"
      >
        <EscalationForm
          onSuccess={() => setShowCreateModal(false)}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
}
