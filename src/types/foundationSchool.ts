export type CohortStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type EnrollmentStatus = 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';

export type CertificateStatus = 'NOT_ISSUED' | 'PENDING' | 'ISSUED';

export type ClassProgressStatus =
  | 'NOT_STARTED'
  | 'SCHEDULED'
  | 'ATTENDED'
  | 'MISSED'
  | 'EXCUSED'
  | 'MAKE_UP_REQUIRED'
  | 'COMPLETED';

export const TOTAL_FOUNDATION_SCHOOL_CLASSES = 7;

export interface FoundationSchoolCohort {
  id: string;
  name: string;
  startDate: string;
  graduationDate: string | null;
  /** Legacy free-text instructor name, kept so older batches keep rendering. */
  instructor: string | null;
  instructorUserId: string | null;
  /** The actual person teaching this batch, when set via the instructor picker. */
  instructorUser?: { id: string; firstName: string; lastName: string } | null;
  status: CohortStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { enrollments: number };
}

export interface FoundationSchoolMemberRef {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
}

export interface FoundationSchoolStaffRef {
  id: string;
  firstName: string;
  lastName: string;
}

export interface FoundationSchoolClassProgress {
  id: string;
  enrollmentId: string;
  classNumber: number;
  status: ClassProgressStatus;
  scheduledDate: string | null;
  attendedDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FoundationSchoolEnrollment {
  id: string;
  memberId: string;
  member: FoundationSchoolMemberRef;
  cohortId: string;
  cohort: FoundationSchoolCohort;
  createdById: string | null;
  createdBy: FoundationSchoolStaffRef | null;
  status: EnrollmentStatus;
  enrollmentDate: string;
  graduationDate: string | null;
  certificateStatus: CertificateStatus;
  notes: string | null;
  classProgress: FoundationSchoolClassProgress[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCohortData {
  name: string;
  startDate: string;
  graduationDate?: string;
  /** Legacy free-text instructor name. Superseded by `instructorUserId`. */
  instructor?: string;
  instructorUserId?: string;
  status?: CohortStatus;
}

export type UpdateCohortData = Partial<CreateCohortData>;

export interface EnrollMemberData {
  memberId: string;
  cohortId: string;
  notes?: string;
}

export interface UpdateEnrollmentData {
  status?: EnrollmentStatus;
  graduationDate?: string;
  certificateStatus?: CertificateStatus;
  notes?: string;
}

export interface UpdateClassProgressData {
  status?: ClassProgressStatus;
  scheduledDate?: string;
  attendedDate?: string;
  notes?: string;
}

export interface GraduationEligibility {
  enrollmentId: string;
  totalClasses: number;
  completedClasses: number;
  eligible: boolean;
}

export interface EnrollmentListFilters {
  cohortId?: string;
  memberId?: string;
  status?: EnrollmentStatus | '';
  page?: number;
  pageSize?: number;
}
