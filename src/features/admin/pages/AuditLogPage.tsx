// NOTE: The backend writes AuditLog rows internally on every mutation
// (via createAuditLog() in church-follow-up-api/src/middleware/audit.ts) but
// does not yet expose any GET /audit-logs (or similar) read endpoint. This
// page is intentionally left on mock data until that endpoint is added —
// this is expected, not a bug to fix in the frontend.
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Activity, Filter } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
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

type ActionType = 'Create' | 'Update' | 'Delete' | 'Login' | 'Export';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: ActionType;
  resource: string;
  details: string;
}

const actionBadgeVariant: Record<ActionType, 'success' | 'info' | 'danger' | 'purple' | 'warning'> = {
  Create: 'success',
  Update: 'info',
  Delete: 'danger',
  Login: 'purple',
  Export: 'warning',
};

const auditData: AuditEntry[] = [
  {
    id: '1',
    timestamp: '2026-07-25T14:30:00',
    user: 'Pastor David Adeyemi',
    action: 'Login',
    resource: 'Auth',
    details: 'Logged in from 192.168.1.1',
  },
  {
    id: '2',
    timestamp: '2026-07-25T13:15:00',
    user: 'Chioma Eze',
    action: 'Create',
    resource: 'Member',
    details: 'Created member: John Obi',
  },
  {
    id: '3',
    timestamp: '2026-07-25T12:45:00',
    user: 'Emeka Okafor',
    action: 'Update',
    resource: 'Follow-Up Task',
    details: 'Marked task #1234 as completed',
  },
  {
    id: '4',
    timestamp: '2026-07-25T11:30:00',
    user: 'Blessing Nwosu',
    action: 'Create',
    resource: 'Interaction',
    details: 'Logged phone call with Mrs. Adebayo',
  },
  {
    id: '5',
    timestamp: '2026-07-25T10:00:00',
    user: 'Pastor David Adeyemi',
    action: 'Create',
    resource: 'Escalation',
    details: 'Created escalation: Family Crisis - Okonkwo',
  },
  {
    id: '6',
    timestamp: '2026-07-25T09:30:00',
    user: 'Chioma Eze',
    action: 'Update',
    resource: 'Campaign',
    details: 'Updated Easter Sunday Reminder campaign',
  },
  {
    id: '7',
    timestamp: '2026-07-24T16:00:00',
    user: 'James Obi',
    action: 'Create',
    resource: 'Interaction',
    details: 'Logged home visit with Deacon Okafor',
  },
  {
    id: '8',
    timestamp: '2026-07-24T14:20:00',
    user: 'Funke Adebayo',
    action: 'Export',
    resource: 'Report',
    details: 'Exported Follow-Up Summary report as PDF',
  },
  {
    id: '9',
    timestamp: '2026-07-24T11:00:00',
    user: 'Samuel Ogundele',
    action: 'Login',
    resource: 'Auth',
    details: 'Logged in from 10.0.0.5',
  },
  {
    id: '10',
    timestamp: '2026-07-24T09:45:00',
    user: 'Chioma Eze',
    action: 'Delete',
    resource: 'Member',
    details: 'Archived member: Inactive User Test',
  },
];

const userOptions = [
  { label: 'All Users', value: '' },
  { label: 'Pastor David Adeyemi', value: 'Pastor David Adeyemi' },
  { label: 'Chioma Eze', value: 'Chioma Eze' },
  { label: 'Emeka Okafor', value: 'Emeka Okafor' },
  { label: 'Blessing Nwosu', value: 'Blessing Nwosu' },
  { label: 'James Obi', value: 'James Obi' },
  { label: 'Funke Adebayo', value: 'Funke Adebayo' },
  { label: 'Samuel Ogundele', value: 'Samuel Ogundele' },
];

const actionOptions = [
  { label: 'All Actions', value: '' },
  { label: 'Create', value: 'Create' },
  { label: 'Update', value: 'Update' },
  { label: 'Delete', value: 'Delete' },
  { label: 'Login', value: 'Login' },
  { label: 'Export', value: 'Export' },
];

export function AuditLogPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedAction, setSelectedAction] = useState('');

  const filteredEntries = auditData.filter((entry) => {
    if (selectedUser && entry.user !== selectedUser) return false;
    if (selectedAction && entry.action !== selectedAction) return false;
    if (startDate && entry.timestamp < startDate) return false;
    if (endDate && entry.timestamp > `${endDate}T23:59:59`) return false;
    return true;
  });

  function handleFilter() {
    // Filtering is already reactive via state; this handler exists
    // for future integration with server-side filtering / API calls.
  }

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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
            />
            <Select
              label="User"
              options={userOptions}
              value={selectedUser}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedUser(e.target.value)}
            />
            <Select
              label="Action Type"
              options={actionOptions}
              value={selectedAction}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedAction(e.target.value)}
            />
            <Button
              variant="outline"
              leftIcon={<Filter className="h-4 w-4" />}
              onClick={handleFilter}
            >
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(entry.timestamp, 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-medium text-slate-900">
                    {entry.user}
                  </TableCell>
                  <TableCell>
                    <Badge variant={actionBadgeVariant[entry.action]}>
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.resource}</TableCell>
                  <TableCell className="text-slate-500">{entry.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
