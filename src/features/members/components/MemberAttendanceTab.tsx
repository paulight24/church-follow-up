import { useQuery } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import { SERVICE_TYPE_LABELS, ATTENDANCE_STATUS_LABELS } from '@/types/attendance';
import type { AttendanceStatus } from '@/types/attendance';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { formatDate } from '@/lib/formatters';
import { attendanceApi } from '@/features/attendance/api/attendance.api';

const statusVariant: Record<AttendanceStatus, 'success' | 'gray' | 'warning'> = {
  PRESENT: 'success',
  ABSENT: 'gray',
  EXCUSED: 'warning',
};

export function MemberAttendanceTab({ memberId }: { memberId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['member-attendance', memberId],
    queryFn: () => attendanceApi.getMemberAttendance(memberId).then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (isError) {
    return <p className="py-12 text-center text-sm text-rose-600">Could not load attendance history.</p>;
  }

  const records = data ?? [];

  if (records.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No attendance recorded yet"
        description="Once this member is checked in to a service, their history will appear here."
      />
    );
  }

  const presentCount = records.filter((r) => r.attendanceStatus === 'PRESENT').length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Present at <span className="font-semibold text-slate-900">{presentCount}</span> of{' '}
        <span className="font-semibold text-slate-900">{records.length}</span> recorded service
        {records.length === 1 ? '' : 's'}.
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium text-slate-900">{record.service.name}</TableCell>
              <TableCell className="text-slate-600">
                {SERVICE_TYPE_LABELS[record.service.serviceType] ?? record.service.serviceType}
              </TableCell>
              <TableCell className="whitespace-nowrap">{formatDate(record.service.serviceDate)}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[record.attendanceStatus] ?? 'gray'} size="sm" dot>
                  {ATTENDANCE_STATUS_LABELS[record.attendanceStatus] ?? record.attendanceStatus}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
