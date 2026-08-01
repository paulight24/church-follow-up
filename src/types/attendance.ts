// Matches the backend `Service` / `AttendanceRecord` models
// (see church-follow-up-api/prisma/schema.prisma) and the response shapes in
// services.service.ts / members.service.ts#listMemberAttendance.

export type ServiceType = 'SUNDAY' | 'MIDWEEK' | 'SPECIAL' | 'PRAYER_MEETING';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED';
/** SELF = member scanned the QR code and checked themselves in. */
export type AttendanceSource = 'MANUAL' | 'QR' | 'IMPORT' | 'SELF';

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
  startTime?: string | null;
  endTime?: string | null;
  /** Self check-in QR state - present once a check-in code has been generated at least once. */
  checkInToken?: string | null;
  checkInEnabled?: boolean;
  checkInOpensAt?: string | null;
  checkInClosesAt?: string | null;
  /** Usher-entered total headcount (including guests with no member record). */
  headcount?: number | null;
  /** Set when this service was generated from a recurring ServiceSchedule. */
  scheduleId?: string | null;
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

export interface AttendanceUserRef {
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
  /** Who recorded this attendance - null for self check-in (the member checked themselves in). */
  recordedBy?: AttendanceUserRef | null;
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

// ─── Attendance reports (GET /services/attendance/summary, /by-member) ─────
// Matches services.service.ts#getAttendanceSummary / #getAttendanceByMember.

export interface ServiceAttendanceSummaryRow {
  id: string;
  name: string;
  serviceDate: string;
  serviceType: ServiceType;
  presentCount: number;
  headcount: number | null;
  /** headcount - presentCount, or null when no headcount was recorded for the service. */
  delta: number | null;
}

export interface ServiceAttendanceSummaryFilters {
  page?: number;
  pageSize?: number;
  serviceType?: ServiceType | '';
  startDate?: string;
  endDate?: string;
  /** Backend only supports sorting by these two columns server-side. */
  sortBy?: 'serviceDate' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface MemberAttendanceSummaryRow {
  memberId: string;
  memberName: string;
  servicesAttended: number;
  servicesHeld: number;
  /** 0-1 fraction (e.g. 0.75 = 75%), not a whole percentage. */
  attendanceRate: number;
  lastAttendedAt: string | null;
}

export interface MemberAttendanceSummaryFilters {
  page?: number;
  pageSize?: number;
  serviceType?: ServiceType | '';
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  fellowshipGroupId?: string;
  sortBy?: 'lastAttendedAt' | 'attendanceRate' | 'servicesAttended' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// ─── Recurring service schedules (GET/POST /service-schedules, etc.) ───────
// Matches service-schedules.service.ts / the ServiceSchedule Prisma model.

export interface ServiceSchedule {
  id: string;
  name: string;
  serviceType: ServiceType;
  /** 0 = Sunday .. 6 = Saturday. */
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  generateDaysAhead: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    services?: number;
  };
}

export interface ServiceScheduleListFilters {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
}

export interface CreateServiceScheduleRequest {
  name: string;
  serviceType?: ServiceType;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
  generateDaysAhead?: number;
}

export type UpdateServiceScheduleRequest = Partial<CreateServiceScheduleRequest>;

export interface GenerateSchedulesResult {
  schedulesProcessed: number;
  servicesCreated: number;
}

// ─── Per-service QR check-in (POST/DELETE /services/:id/check-in-code) ────

export interface CheckInCodeRequest {
  opensAt?: string;
  closesAt?: string;
}

export interface CheckInCodeResponse {
  token: string;
  checkInUrl: string;
  checkInOpensAt: string | null;
  checkInClosesAt: string | null;
}
