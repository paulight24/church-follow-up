import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Users,
  Trophy,
  PhoneOff,
  AlarmClockOff,
  CalendarCheck,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/formatters';
import { reportsApi } from '../api/reports.api';
import { ReportFilters, type ReportFilterField } from '../components/ReportFilters';
import type { AnyReport, ReportFilters as ReportFiltersState, ReportType } from '@/types/report';

interface ReportDefinition {
  id: ReportType;
  title: string;
  description: string;
  icon: ReactNode;
  fields: ReportFilterField[];
}

const REPORTS: ReportDefinition[] = [
  {
    id: 'follow-ups',
    title: 'Follow-Up Summary',
    description: 'Completion rates, status and priority breakdowns for follow-up tasks',
    icon: <ClipboardList className="mb-3 h-10 w-10 text-indigo-500" />,
    fields: ['dateRange', 'team', 'leader', 'worker', 'department', 'fellowshipGroup', 'status', 'priority'],
  },
  {
    id: 'members',
    title: 'Member Status',
    description: 'Membership status, journey stage, and contact completeness by member',
    icon: <Users className="mb-3 h-10 w-10 text-indigo-500" />,
    fields: ['dateRange', 'department', 'fellowshipGroup'],
  },
  {
    id: 'team-performance',
    title: 'Team Performance',
    description: 'Per-team worker counts, task volume, completion and overdue rates',
    icon: <Trophy className="mb-3 h-10 w-10 text-indigo-500" />,
    fields: ['dateRange', 'team', 'worker', 'status', 'priority'],
  },
  {
    id: 'contact-completeness',
    title: 'Contact Completeness',
    description: 'Members missing a phone number and/or email address',
    icon: <PhoneOff className="mb-3 h-10 w-10 text-indigo-500" />,
    fields: ['department', 'fellowshipGroup'],
  },
  {
    id: 'overdue-tasks',
    title: 'Overdue Tasks',
    description: 'Follow-up tasks currently past their due date, with days overdue',
    icon: <AlarmClockOff className="mb-3 h-10 w-10 text-indigo-500" />,
    fields: ['team', 'worker', 'department', 'fellowshipGroup', 'priority'],
  },
];

function fetchReport(type: ReportType, filters: ReportFiltersState) {
  switch (type) {
    case 'follow-ups':
      return reportsApi.getFollowUpReport(filters).then((r) => r.data);
    case 'members':
      return reportsApi.getMemberReport(filters).then((r) => r.data);
    case 'team-performance':
      return reportsApi.getTeamPerformanceReport(filters).then((r) => r.data);
    case 'contact-completeness':
      return reportsApi.getContactCompletenessReport(filters).then((r) => r.data);
    case 'overdue-tasks':
      return reportsApi.getOverdueTasksReport(filters).then((r) => r.data);
  }
}

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const str = value == null ? '' : String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const { hasPermission } = useAuth();
  const [selectedId, setSelectedId] = useState<ReportType | null>(null);
  const [filters, setFilters] = useState<ReportFiltersState>({});

  const selected = useMemo(() => REPORTS.find((r) => r.id === selectedId) ?? null, [selectedId]);

  const reportQuery = useQuery<AnyReport>({
    queryKey: ['reports', selectedId, filters],
    queryFn: () => fetchReport(selectedId!, filters),
    enabled: !!selectedId,
  });

  const handleSelect = (id: ReportType) => {
    setFilters({});
    setSelectedId(id);
  };

  const rows = reportQuery.data?.rows ?? [];
  const csvRows = rows as unknown as Array<Record<string, unknown>>;

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate and export ministry reports" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => (
          <Card
            key={report.id}
            className={cn(
              'cursor-pointer transition-shadow hover:shadow-md',
              selectedId === report.id && 'ring-2 ring-indigo-500',
            )}
            onClick={() => handleSelect(report.id)}
          >
            <CardContent className="flex flex-col">
              {report.icon}
              <CardTitle className="mb-2">{report.title}</CardTitle>
              <p className="flex-1 text-sm text-slate-500">{report.description}</p>
            </CardContent>
          </Card>
        ))}

        {/* Attendance Reports lives on its own page (sortable, paginated),
            not in this card-select-and-filter flow - this card is a
            discoverability link there, matching Paul's ask to surface it
            "under reports" as well as under Attendance. */}
        {hasPermission('attendance.view_reports') && (
          <Link to="/services/reports">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col">
                <CalendarCheck className="mb-3 h-10 w-10 text-indigo-500" />
                <CardTitle className="mb-2">Attendance Reports</CardTitle>
                <p className="flex-1 text-sm text-slate-500">
                  Service-by-service and member-by-member attendance, sortable by date, present count, and
                  who&rsquo;s stopped coming
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {selected && (
        <Card>
          <CardContent className="space-y-5 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle>{selected.title}</CardTitle>
            </div>

            <ReportFilters
              fields={selected.fields}
              filters={filters}
              onChange={setFilters}
              onGenerate={() => reportQuery.refetch()}
              onExport={() => downloadCsv(`${selected.id}-${new Date().toISOString().slice(0, 10)}.csv`, csvRows)}
              exportDisabled={rows.length === 0}
              isLoading={reportQuery.isFetching}
            />

            {reportQuery.isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" className="text-indigo-600" />
              </div>
            ) : reportQuery.isError ? (
              <p className="py-8 text-center text-sm text-rose-600">Failed to load report data.</p>
            ) : (
              <>
                <ReportSummary reportType={selected.id} data={reportQuery.data} />
                <ReportTable reportType={selected.id} rows={csvRows} />
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ReportSummary({ reportType, data }: { reportType: ReportType; data: unknown }) {
  if (!data) return null;

  if (reportType === 'follow-ups') {
    const s = (data as Awaited<ReturnType<typeof reportsApi.getFollowUpReport>>['data']).summary;
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total Tasks" value={s.total} />
        <StatTile label="Completed" value={s.completed} />
        <StatTile label="Completion Rate" value={`${s.completionRate}%`} />
        <StatTile label="Avg Days to First Attempt" value={s.avgDaysToFirstAttempt} />
      </div>
    );
  }

  if (reportType === 'members') {
    const s = (data as Awaited<ReturnType<typeof reportsApi.getMemberReport>>['data']).summary;
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total Members" value={s.total} />
        <StatTile label="First Timers" value={s.firstTimers} />
        <StatTile label="Membership Statuses" value={s.byMembershipStatus.length} />
        <StatTile label="Journey Stages" value={s.byJourneyStage.length} />
      </div>
    );
  }

  if (reportType === 'team-performance') {
    const s = (data as Awaited<ReturnType<typeof reportsApi.getTeamPerformanceReport>>['data']).summary;
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Teams" value={s.teamCount} />
      </div>
    );
  }

  if (reportType === 'contact-completeness') {
    const s = (data as Awaited<ReturnType<typeof reportsApi.getContactCompletenessReport>>['data']).summary;
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total Members" value={s.totalMembers} />
        <StatTile label="Missing Contact" value={s.missingContactCount} />
        <StatTile label="Complete %" value={`${s.completePercentage}%`} />
      </div>
    );
  }

  if (reportType === 'overdue-tasks') {
    const s = (data as Awaited<ReturnType<typeof reportsApi.getOverdueTasksReport>>['data']).summary;
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Overdue Tasks" value={s.total} />
      </div>
    );
  }

  return null;
}

function ReportTable({ reportType, rows }: { reportType: ReportType; rows: Array<Record<string, unknown>> }) {
  if (reportType === 'follow-ups') {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Worker</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableEmpty colSpan={7} message="No follow-up tasks match these filters." />
          ) : (
            rows.map((r) => (
              <TableRow key={String(r.taskId)}>
                <TableCell className="font-medium text-slate-900">{String(r.memberName)}</TableCell>
                <TableCell>{String(r.team || '--')}</TableCell>
                <TableCell>{String(r.assignedWorker)}</TableCell>
                <TableCell>{String(r.reasonCode)}</TableCell>
                <TableCell>{String(r.priority)}</TableCell>
                <TableCell>{String(r.status)}</TableCell>
                <TableCell>{r.dueAt ? formatDate(String(r.dueAt)) : '--'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  }

  if (reportType === 'members') {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Cell Group</TableHead>
            <TableHead>First Timer</TableHead>
            <TableHead>Has Phone</TableHead>
            <TableHead>Has Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableEmpty colSpan={7} message="No members match these filters." />
          ) : (
            rows.map((r) => (
              <TableRow key={String(r.memberId)}>
                <TableCell className="font-medium text-slate-900">
                  {String(r.firstName)} {String(r.lastName)}
                </TableCell>
                <TableCell>{String(r.membershipStatus || '--')}</TableCell>
                <TableCell>{String(r.department || '--')}</TableCell>
                <TableCell>{String(r.fellowshipGroup || '--')}</TableCell>
                <TableCell>{r.isFirstTimer ? 'Yes' : 'No'}</TableCell>
                <TableCell>{r.hasPhone ? 'Yes' : 'No'}</TableCell>
                <TableCell>{r.hasEmail ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  }

  if (reportType === 'team-performance') {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead>Leader</TableHead>
            <TableHead>Workers</TableHead>
            <TableHead>Total Tasks</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Overdue</TableHead>
            <TableHead>Completion Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableEmpty colSpan={7} message="No teams match these filters." />
          ) : (
            rows.map((r) => (
              <TableRow key={String(r.teamId)}>
                <TableCell className="font-medium text-slate-900">{String(r.teamName)}</TableCell>
                <TableCell>{String(r.leaderName || '--')}</TableCell>
                <TableCell>{String(r.workerCount)}</TableCell>
                <TableCell>{String(r.totalTasks)}</TableCell>
                <TableCell>{String(r.completedTasks)}</TableCell>
                <TableCell>{String(r.overdueTasks)}</TableCell>
                <TableCell>{String(r.completionRate)}%</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  }

  if (reportType === 'contact-completeness') {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Cell Group</TableHead>
            <TableHead>Missing Phone</TableHead>
            <TableHead>Missing Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableEmpty colSpan={5} message="No members are missing contact info." />
          ) : (
            rows.map((r) => (
              <TableRow key={String(r.memberId)}>
                <TableCell className="font-medium text-slate-900">
                  {String(r.firstName)} {String(r.lastName)}
                </TableCell>
                <TableCell>{String(r.department || '--')}</TableCell>
                <TableCell>{String(r.fellowshipGroup || '--')}</TableCell>
                <TableCell>{r.missingPhone ? 'Yes' : 'No'}</TableCell>
                <TableCell>{r.missingEmail ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  }

  // overdue-tasks
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Team</TableHead>
          <TableHead>Worker</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Days Overdue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableEmpty colSpan={7} message="No overdue tasks. Great work!" />
        ) : (
          rows.map((r) => (
            <TableRow key={String(r.taskId)}>
              <TableCell className="font-medium text-slate-900">{String(r.memberName)}</TableCell>
              <TableCell>{String(r.team || '--')}</TableCell>
              <TableCell>{String(r.assignedWorker)}</TableCell>
              <TableCell>{String(r.priority)}</TableCell>
              <TableCell>{String(r.status)}</TableCell>
              <TableCell>{r.dueAt ? formatDate(String(r.dueAt)) : '--'}</TableCell>
              <TableCell className="font-medium text-rose-600">{String(r.daysOverdue)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
