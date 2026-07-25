import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Filter } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/formatters';
import { auditLogsApi } from '../api/auditLogs.api';

const actionBadgeVariant: Record<string, 'success' | 'info' | 'danger' | 'purple' | 'warning' | 'default'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
  LOGIN: 'purple',
  LOGOUT: 'purple',
  EXPORT: 'warning',
  SEND: 'info',
  APPROVE: 'success',
};

export function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');

  const filters = {
    page,
    pageSize: 20,
    action: selectedAction || undefined,
    entity: selectedEntity || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditLogsApi.getAuditLogs(filters).then((res) => res.data),
  });

  const { data: actions } = useQuery({
    queryKey: ['audit-logs', 'actions'],
    queryFn: () => auditLogsApi.getActions().then((res) => res.data),
  });

  const { data: entities } = useQuery({
    queryKey: ['audit-logs', 'entities'],
    queryFn: () => auditLogsApi.getEntities().then((res) => res.data),
  });

  const actionOptions = [
    { label: 'All Actions', value: '' },
    ...(actions ?? []).map((a) => ({ label: a, value: a })),
  ];

  const entityOptions = [
    { label: 'All Resources', value: '' },
    ...(entities ?? []).map((e) => ({ label: e, value: e })),
  ];

  const entries = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Track all system activities and changes"
        actions={
          <div className="flex items-center gap-2 text-slate-400">
            <Activity className="h-5 w-5" />
          </div>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
            <Select
              label="Action Type"
              options={actionOptions}
              value={selectedAction}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                setSelectedAction(e.target.value);
                setPage(1);
              }}
            />
            <Select
              label="Resource"
              options={entityOptions}
              value={selectedEntity}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                setSelectedEntity(e.target.value);
                setPage(1);
              }}
            />
            <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />} disabled>
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" className="text-indigo-600" />
            </div>
          ) : entries.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No audit log entries"
              description="No activity matches the current filters."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Entity ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(entry.createdAt, 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-medium text-slate-900">
                        {entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : 'System'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={actionBadgeVariant[entry.action] ?? 'default'}>
                          {entry.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.entity}</TableCell>
                      <TableCell className="text-slate-500">
                        {entry.entityId ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data && data.meta.totalPages > 1 && (
                <div className="border-t border-slate-200 p-4">
                  <Pagination
                    currentPage={page}
                    totalPages={data.meta.totalPages}
                    onPageChange={setPage}
                    totalItems={data.meta.total}
                    pageSize={data.meta.limit}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
