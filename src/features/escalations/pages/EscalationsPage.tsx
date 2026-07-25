import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import type { EscalationStatus } from '@/types/escalation';
import { formatDate, formatMemberName } from '@/lib/formatters';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabList, Tab } from '@/components/ui/Tabs';
import { Spinner } from '@/components/ui/Spinner';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { usePermission } from '@/hooks/usePermission';
import { EscalationForm } from '../components/EscalationForm';
import { escalationsApi } from '../api/escalations.api';
import { CATEGORY_LABELS, PRIORITY_BADGE, PRIORITY_LABELS, STATUS_BADGE, STATUS_LABELS } from '../lib/escalationDisplay';

type TabValue = 'ALL' | EscalationStatus;

export function EscalationsPage() {
  const navigate = useNavigate();
  const canCreate = usePermission('escalations.create');
  const [activeTab, setActiveTab] = useState<TabValue>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['escalations'],
    queryFn: () => escalationsApi.getEscalations({ pageSize: 200 }).then((r) => r.data),
  });

  const escalations = useMemo(() => data?.data ?? [], [data]);

  const filteredEscalations = useMemo(
    () => (activeTab === 'ALL' ? escalations : escalations.filter((e) => e.status === activeTab)),
    [escalations, activeTab],
  );

  const countFor = (status: EscalationStatus) => escalations.filter((e) => e.status === status).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Escalations"
        subtitle="Track and manage pastoral care escalations"
        actions={
          canCreate && (
            <Button leftIcon={<AlertTriangle className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
              Report Escalation
            </Button>
          )
        }
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabList className="overflow-x-auto">
          <Tab value="ALL">All ({escalations.length})</Tab>
          <Tab value="OPEN">Open ({countFor('OPEN')})</Tab>
          <Tab value="ACKNOWLEDGED">Acknowledged ({countFor('ACKNOWLEDGED')})</Tab>
          <Tab value="IN_PROGRESS">In Progress ({countFor('IN_PROGRESS')})</Tab>
          <Tab value="RESOLVED">Resolved ({countFor('RESOLVED')})</Tab>
          <Tab value="CLOSED">Closed ({countFor('CLOSED')})</Tab>
        </TabList>
      </Tabs>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-rose-600">
            Failed to load escalations. Please try again.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Summary</TableHead>
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
                    <span className="font-medium text-slate-900">{formatMemberName(escalation.member)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" size="sm">
                      {CATEGORY_LABELS[escalation.category] ?? escalation.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={PRIORITY_BADGE[escalation.priority]} size="sm">
                      {PRIORITY_LABELS[escalation.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="block max-w-xs truncate">{escalation.summary}</span>
                  </TableCell>
                  <TableCell>{formatMemberName(escalation.createdBy)}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(escalation.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[escalation.status]} dot>
                      {STATUS_LABELS[escalation.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/escalations/${escalation.id}`)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredEscalations.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">No escalations match this filter.</div>
          )}
        </Card>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Report Escalation" size="lg">
        <EscalationForm onSuccess={() => setShowCreateModal(false)} onCancel={() => setShowCreateModal(false)} />
      </Modal>
    </div>
  );
}
