import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Check, ChevronLeft, Users } from 'lucide-react';
import type { AttendanceStatus } from '@/types/attendance';
import { SERVICE_TYPE_LABELS } from '@/types/attendance';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/lib/formatters';
import { membersApi } from '@/features/members/api/members.api';
import { attendanceApi } from '../api/attendance.api';

export function ServiceAttendancePage() {
  const { id } = useParams<{ id: string }>();
  const serviceId = id!;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => attendanceApi.getService(serviceId).then((res) => res.data),
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ['service-attendance', serviceId],
    queryFn: () => attendanceApi.getAttendance(serviceId).then((res) => res.data.data),
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['members', 'attendance-picker', debouncedSearch],
    queryFn: () =>
      membersApi
        .getMembers({ search: debouncedSearch || undefined, pageSize: 50, sortBy: 'firstName', sortOrder: 'asc' })
        .then((res) => res.data.data),
  });

  // memberId -> status, so each row knows whether it's already been recorded.
  const statusByMember = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    (attendance ?? []).forEach((r) => map.set(r.memberId, r.attendanceStatus));
    return map;
  }, [attendance]);

  const presentCount = useMemo(
    () => (attendance ?? []).filter((r) => r.attendanceStatus === 'PRESENT').length,
    [attendance],
  );

  const mutation = useMutation({
    mutationFn: ({ memberId, status }: { memberId: string; status: AttendanceStatus }) =>
      attendanceApi.recordAttendance(serviceId, { memberId, attendanceStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-attendance', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['service', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: () => {
      toast({ title: 'Could not save attendance', variant: 'error' });
    },
  });

  // Which member row the mutation is currently working on, so only that row spins.
  const pendingMemberId = mutation.isPending ? mutation.variables?.memberId : undefined;

  if (serviceLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={service?.name ?? 'Service'}
        subtitle={
          service
            ? `${SERVICE_TYPE_LABELS[service.serviceType] ?? service.serviceType} · ${formatDate(service.serviceDate)}`
            : undefined
        }
        breadcrumbs={[{ label: 'Services', href: '/services' }, { label: service?.name ?? 'Service' }]}
        actions={
          <Link to="/services">
            <Button variant="outline" size="sm" leftIcon={<ChevronLeft className="h-4 w-4" />}>
              All Services
            </Button>
          </Link>
        }
      />

      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
            <Users className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-900">{presentCount}</p>
            <p className="text-sm text-emerald-700">Checked in</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search members by name, email, or phone..."
            className="sm:max-w-md"
          />
          <p className="mt-2 text-xs text-slate-500">
            Tap a member to mark them present. Tap again to undo.
          </p>
        </div>

        {membersLoading || attendanceLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : (members ?? []).length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-500">No members match that search.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {(members ?? []).map((member) => {
              const status = statusByMember.get(member.id);
              const isPresent = status === 'PRESENT';
              const isSaving = pendingMemberId === member.id;

              return (
                <li key={member.id}>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() =>
                      mutation.mutate({
                        memberId: member.id,
                        status: isPresent ? 'ABSENT' : 'PRESENT',
                      })
                    }
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors sm:px-6 ${
                      isPresent ? 'bg-emerald-50 hover:bg-emerald-100' : 'hover:bg-slate-50'
                    } disabled:opacity-60`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{member.displayName}</p>
                      {member.phonePrimary && (
                        <p className="truncate text-xs text-slate-500">{member.phonePrimary}</p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {status && status !== 'PRESENT' && (
                        <Badge variant="gray" size="sm">
                          {status === 'ABSENT' ? 'Absent' : 'Excused'}
                        </Badge>
                      )}
                      {isSaving ? (
                        <Spinner size="sm" />
                      ) : (
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                            isPresent
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isPresent && <Check className="h-4 w-4" />}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {service && (
        <p className="flex items-center justify-center gap-1.5 pb-4 text-xs text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" />
          Attendance is saved as you tap — no separate save step.
        </p>
      )}
    </div>
  );
}
