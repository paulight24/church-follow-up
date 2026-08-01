import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ArrowUpDown, CalendarDays, TrendingDown, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Pagination } from '@/components/ui/Pagination';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from '@/components/ui/Table';
import { cn } from '@/lib/cn';
import { formatDate, formatRelativeDate } from '@/lib/formatters';
import api from '@/config/api';
import { SERVICE_TYPE_LABELS } from '@/types/attendance';
import type { ServiceType } from '@/types/attendance';
import { attendanceApi } from '../api/attendance.api';

const PAGE_SIZE = 15;

const SERVICE_TYPE_OPTIONS = [
  { value: '', label: 'All service types' },
  ...(Object.keys(SERVICE_TYPE_LABELS) as ServiceType[]).map((value) => ({
    value,
    label: SERVICE_TYPE_LABELS[value],
  })),
];

interface LookupOption {
  id: string;
  name: string;
}

function SortHeader({
  label,
  active,
  order,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  order: 'asc' | 'desc';
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider transition-colors',
        active ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700',
        className,
      )}
    >
      {label}
      {active ? (
        order === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 text-slate-300" />
      )}
    </button>
  );
}

function AttendanceRateBadge({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100);
  const variant = pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'danger';
  return (
    <Badge variant={variant} size="sm" dot>
      {pct}%
    </Badge>
  );
}

// ─── By service ─────────────────────────────────────────────────────────

type ServiceSortBy = 'serviceDate' | 'name' | 'presentCount';

function ByServiceReport() {
  const [page, setPage] = useState(1);
  const [serviceType, setServiceType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<ServiceSortBy>('serviceDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // The backend only sorts server-side by `serviceDate`/`name`; sorting by
  // present count happens client-side on the fetched page (see note in the
  // report to the tech lead - there's no server-side aggregate sort for a
  // computed column without fetching every row).
  const apiSortBy = sortBy === 'presentCount' ? 'serviceDate' : sortBy;

  const query = useQuery({
    queryKey: ['attendance-reports', 'by-service', { page, serviceType, startDate, endDate, apiSortBy, sortOrder }],
    queryFn: () =>
      attendanceApi
        .getAttendanceSummary({
          page,
          pageSize: PAGE_SIZE,
          serviceType: (serviceType || undefined) as ServiceType | undefined,
          startDate: startDate ? new Date(`${startDate}T00:00:00`).toISOString() : undefined,
          endDate: endDate ? new Date(`${endDate}T23:59:59`).toISOString() : undefined,
          sortBy: apiSortBy,
          sortOrder,
        })
        .then((res) => res.data),
  });

  const rows = useMemo(() => {
    const data = query.data?.data ?? [];
    if (sortBy !== 'presentCount') return data;
    const sorted = [...data].sort((a, b) => a.presentCount - b.presentCount);
    if (sortOrder === 'desc') sorted.reverse();
    return sorted;
  }, [query.data, sortBy, sortOrder]);

  const meta = query.data?.meta;

  function toggleSort(column: ServiceSortBy) {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder(column === 'presentCount' ? 'desc' : 'desc');
    }
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-56">
          <Select
            label="Service type"
            options={SERVICE_TYPE_OPTIONS}
            value={serviceType}
            onChange={(e) => {
              setServiceType(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:w-44">
          <DatePicker
            label="Start date"
            value={startDate}
            onChange={(v) => {
              setStartDate(v);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:w-44">
          <DatePicker
            label="End date"
            value={endDate}
            onChange={(v) => {
              setEndDate(v);
              setPage(1);
            }}
          />
        </div>
      </div>

      {query.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : query.isError ? (
        <p className="py-16 text-center text-sm text-rose-600">Could not load the attendance report.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortHeader
                    label="Date"
                    active={sortBy === 'serviceDate'}
                    order={sortOrder}
                    onClick={() => toggleSort('serviceDate')}
                  />
                </TableHead>
                <TableHead>
                  <SortHeader
                    label="Service"
                    active={sortBy === 'name'}
                    order={sortOrder}
                    onClick={() => toggleSort('name')}
                  />
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>
                  <SortHeader
                    label="Present"
                    active={sortBy === 'presentCount'}
                    order={sortOrder}
                    onClick={() => toggleSort('presentCount')}
                  />
                </TableHead>
                <TableHead>Headcount</TableHead>
                <TableHead>Difference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmpty
                  colSpan={6}
                  icon={<CalendarDays className="h-8 w-8" />}
                  message="No services match these filters."
                />
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(row.serviceDate)}</TableCell>
                    <TableCell className="font-medium text-slate-900">{row.name}</TableCell>
                    <TableCell>
                      <Badge variant="gray" size="sm">
                        {SERVICE_TYPE_LABELS[row.serviceType] ?? row.serviceType}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.presentCount}</TableCell>
                    <TableCell>{row.headcount ?? <span className="text-slate-400">--</span>}</TableCell>
                    <TableCell>
                      {row.delta == null ? (
                        <span className="text-slate-400">--</span>
                      ) : (
                        <span
                          className={cn(
                            'font-medium',
                            row.delta > 0 ? 'text-amber-600' : row.delta < 0 ? 'text-rose-600' : 'text-slate-500',
                          )}
                        >
                          {row.delta > 0 ? `+${row.delta}` : row.delta}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {meta && meta.totalPages > 1 && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              pageSize={meta.limit}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── By member ──────────────────────────────────────────────────────────

type MemberSortBy = 'lastAttendedAt' | 'attendanceRate' | 'servicesAttended' | 'name';

function ByMemberReport() {
  const [page, setPage] = useState(1);
  const [departmentId, setDepartmentId] = useState('');
  const [fellowshipGroupId, setFellowshipGroupId] = useState('');
  // Defaults to the "who's stopped coming" view - oldest/never-attended first.
  const [sortBy, setSortBy] = useState<MemberSortBy>('lastAttendedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const departmentsQuery = useQuery({
    queryKey: ['attendance-reports', 'lookup', 'departments'],
    queryFn: () =>
      api.get<{ data: LookupOption[] }>('/departments', { params: { pageSize: 100 } }).then((r) => r.data.data ?? []),
  });
  const fellowshipGroupsQuery = useQuery({
    queryKey: ['attendance-reports', 'lookup', 'fellowship-groups'],
    queryFn: () =>
      api
        .get<{ data: LookupOption[] }>('/fellowship-groups', { params: { pageSize: 100 } })
        .then((r) => r.data.data ?? []),
  });

  const query = useQuery({
    queryKey: ['attendance-reports', 'by-member', { page, departmentId, fellowshipGroupId, sortBy, sortOrder }],
    queryFn: () =>
      attendanceApi
        .getAttendanceByMember({
          page,
          pageSize: PAGE_SIZE,
          departmentId: departmentId || undefined,
          fellowshipGroupId: fellowshipGroupId || undefined,
          sortBy,
          sortOrder,
        })
        .then((res) => res.data),
  });

  const rows = query.data?.data ?? [];
  const meta = query.data?.meta;

  function toggleSort(column: MemberSortBy) {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder(column === 'lastAttendedAt' ? 'asc' : 'desc');
    }
    setPage(1);
  }

  function showMostOverdueFirst() {
    setSortBy('lastAttendedAt');
    setSortOrder('asc');
    setPage(1);
  }

  const isShowingMostOverdue = sortBy === 'lastAttendedAt' && sortOrder === 'asc';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-56">
          <Select
            label="Department"
            options={[
              { value: '', label: 'All departments' },
              ...(departmentsQuery.data ?? []).map((d) => ({ value: d.id, label: d.name })),
            ]}
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            label="Cell group"
            options={[
              { value: '', label: 'All cell groups' },
              ...(fellowshipGroupsQuery.data ?? []).map((g) => ({ value: g.id, label: g.name })),
            ]}
            value={fellowshipGroupId}
            onChange={(e) => {
              setFellowshipGroupId(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <button
          type="button"
          onClick={showMostOverdueFirst}
          disabled={isShowingMostOverdue}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
            isShowingMostOverdue
              ? 'cursor-default border-indigo-200 bg-indigo-50 text-indigo-700'
              : 'border-slate-300 text-slate-700 hover:bg-slate-50',
          )}
        >
          <TrendingDown className="h-4 w-4" />
          Show who&apos;s stopped coming
        </button>
      </div>

      {query.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : query.isError ? (
        <p className="py-16 text-center text-sm text-rose-600">Could not load the attendance report.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortHeader
                    label="Member"
                    active={sortBy === 'name'}
                    order={sortOrder}
                    onClick={() => toggleSort('name')}
                  />
                </TableHead>
                <TableHead>
                  <SortHeader
                    label="Attended"
                    active={sortBy === 'servicesAttended'}
                    order={sortOrder}
                    onClick={() => toggleSort('servicesAttended')}
                  />
                </TableHead>
                <TableHead>Services held</TableHead>
                <TableHead>
                  <SortHeader
                    label="Attendance rate"
                    active={sortBy === 'attendanceRate'}
                    order={sortOrder}
                    onClick={() => toggleSort('attendanceRate')}
                  />
                </TableHead>
                <TableHead>
                  <SortHeader
                    label="Last attended"
                    active={sortBy === 'lastAttendedAt'}
                    order={sortOrder}
                    onClick={() => toggleSort('lastAttendedAt')}
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmpty colSpan={5} icon={<Users className="h-8 w-8" />} message="No members match these filters." />
              ) : (
                rows.map((row) => (
                  <TableRow key={row.memberId}>
                    <TableCell className="font-medium text-slate-900">{row.memberName}</TableCell>
                    <TableCell>{row.servicesAttended}</TableCell>
                    <TableCell>{row.servicesHeld}</TableCell>
                    <TableCell>
                      <AttendanceRateBadge rate={row.attendanceRate} />
                    </TableCell>
                    <TableCell>
                      {row.lastAttendedAt ? (
                        formatRelativeDate(row.lastAttendedAt)
                      ) : (
                        <span className="font-medium text-rose-600">Never</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {meta && meta.totalPages > 1 && (
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              pageSize={meta.limit}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────

export function AttendanceReportsPage() {
  const [tab, setTab] = useState<'service' | 'member'>('service');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Reports"
        subtitle="See attendance in totality, sortable by date, service, and member — for pastoral decisions"
      />

      <Card>
        <CardContent className="pt-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'service' | 'member')}>
            <TabList>
              <Tab value="service">By Service</Tab>
              <Tab value="member">By Member</Tab>
            </TabList>
            <TabPanel value="service">
              <ByServiceReport />
            </TabPanel>
            <TabPanel value="member">
              <ByMemberReport />
            </TabPanel>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
