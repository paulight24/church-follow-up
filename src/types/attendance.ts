// Matches the backend `Service` / `AttendanceRecord` models
// (see church-follow-up-api/prisma/schema.prisma) and the response shapes in
// services.service.ts / members.service.ts#listMemberAttendance.

export type ServiceType = 'SUNDAY' | 'MIDWEEK' | 'SPECIAL' | 'PRAYER_MEETING';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED';
export type AttendanceSource = 'MANUAL' | 'QR' | 'IMPORT';

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  SUNDAY: 'Sunday Service',
  MIDWEEK: 'Midweek Service',
  SPECIAL: 'Special Service',
  PRAYER_MEETING: 'Prayer Meeting',
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  EXCUSED: 'Excused',
};

export interface Service {
  id: string;
  name: string;
  serviceDate: string;
  serviceType: ServiceType;
  createdAt: string;
  updatedAt: string;
  _count?: {
    attendanceRecords?: number;
    serviceVisits?: number;
    usherAssignments?: number;
  };
}

export interface AttendanceMemberRef {
  id: string;
  firstName: string;
  lastName: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  serviceId: string;
  attendanceStatus: AttendanceStatus;
  checkedInAt: string | null;
  source: AttendanceSource;
  createdAt: string;
  member?: AttendanceMemberRef;
}

/** Shape returned by GET /members/:id/attendance - service is joined in. */
export interface MemberAttendanceRecord extends AttendanceRecord {
  service: {
    id: string;
    name: string;
    serviceDate: string;
    serviceType: ServiceType;
  };
}

export interface ServiceListFilters {
  page?: number;
  pageSize?: number;
  serviceType?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateServiceRequest {
  name: string;
  serviceDate: string;
  serviceType?: ServiceType;
}

export interface UpdateServiceRequest {
  name?: string;
  serviceDate?: string;
  serviceType?: ServiceType;
}

export interface RecordAttendanceRequest {
  memberId: string;
  attendanceStatus?: AttendanceStatus;
  checkedInAt?: string;
  source?: AttendanceSource;
}
