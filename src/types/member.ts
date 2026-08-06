// Matches the backend `Member` model (see church-follow-up-api/prisma/schema.prisma)
// and the shape produced by members.service.ts (withDisplayName + relation includes).

export type Gender = 'MALE' | 'FEMALE';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
export type PreferredContactMethod = 'PHONE' | 'SMS' | 'EMAIL' | 'WHATSAPP';
export type MemberSource = 'GENERAL_FORM' | 'FIRST_TIMER_FORM' | 'IMPORT' | 'MANUAL' | 'CAMPAIGN';
export type VisitorJourneyStage =
  | 'NEW_FIRST_TIMER'
  | 'CONTACT_ATTEMPTED'
  | 'CONTACTED'
  | 'RETURNING_VISITOR'
  | 'FOUNDATION_SCHOOL_INVITED'
  | 'FOUNDATION_SCHOOL_ENROLLED'
  | 'FOUNDATION_SCHOOL_IN_PROGRESS'
  | 'GRADUATED'
  | 'ASSIGNED_TO_CELL'
  | 'ESTABLISHED_MEMBER';

export interface Household {
  id: string;
  householdName: string;
  primaryMemberId?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipStatus {
  id: string;
  name: string;
  color?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  description?: string | null;
  status: string;
}

export interface FellowshipGroup {
  id: string;
  name: string;
  leaderUserId?: string | null;
  meetingLocation?: string | null;
  status: string;
}

export interface MemberContactVerification {
  id: string;
  memberId: string;
  verificationStatus: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  verifiedByUserId?: string | null;
  verifiedBy?: { id: string; firstName: string; lastName: string } | null;
  verificationSource?: string | null;
  verifiedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MemberAssignmentWorkerRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/** Nested under a member's `getMember` response — active assignment(s) to a follow-up team/worker. */
export interface MemberAssignmentSummary {
  id: string;
  teamId: string;
  team: { id: string; name: string };
  primaryWorkerUserId: string;
  primaryWorker: MemberAssignmentWorkerRef;
  backupWorkerUserId?: string | null;
  backupWorker?: MemberAssignmentWorkerRef | null;
  startsAt: string;
  endsAt?: string | null;
  active: boolean;
}

export interface Member {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  preferredName?: string | null;
  /** Computed server-side: preferredName ?? firstName + ' ' + lastName */
  displayName: string;
  phonePrimary?: string | null;
  phoneSecondary?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  weddingAnniversary?: string | null;
  gender?: Gender | null;
  maritalStatus?: MaritalStatus | null;
  householdId?: string | null;
  household?: Household | null;
  departmentId?: string | null;
  department?: Department | null;
  fellowshipGroupId?: string | null;
  fellowshipGroup?: FellowshipGroup | null;
  membershipStatusId?: string | null;
  membershipStatus?: MembershipStatus | null;
  preferredContactMethod?: PreferredContactMethod | null;
  preferredLanguage?: string | null;
  lastAttendanceDate?: string | null;
  communicationConsentEmail: boolean;
  communicationConsentSms: boolean;
  doNotContact: boolean;
  generalNotes?: string | null;
  /** Only present when the caller has `members.view_pastoral_notes`; otherwise the key is stripped by the API. */
  pastoralNotes?: string | null;
  source?: MemberSource | null;
  isFirstTimer: boolean;
  firstVisitDate?: string | null;
  bornAgainStatus?: string | null;
  inviterName?: string | null;
  inviterPhone?: string | null;
  visitorJourneyStage?: VisitorJourneyStage | null;
  profileImageUrl?: string | null;
  createdById?: string | null;
  updatedById?: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  _count?: {
    followUpTasks?: number;
    prayerRequests?: number;
    escalations?: number;
    encouragementRecipients?: number;
    foundationSchoolEnrollments?: number;
  };
  // ─── Present only on GET /members/:id ─────────────────────
  householdMemberships?: Array<{ id: string; household: Household }>;
  memberAssignments?: MemberAssignmentSummary[];
  contactVerifications?: MemberContactVerification[];
  createdBy?: { id: string; firstName: string; lastName: string } | null;
  updatedBy?: { id: string; firstName: string; lastName: string } | null;
  /**
   * The login linked to this member (Prisma: Member.userAccount, the reverse
   * side of User.memberId). Selected by GET /members so the member list can
   * show who already has an app login and who has an invite outstanding.
   * Undefined is treated the same as null (no login) so the UI degrades safely.
   */
  userAccount?: { id: string; status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'DEACTIVATED' } | null;
}

export interface MemberListFilters {
  search?: string;
  membershipStatusId?: string;
  departmentId?: string;
  fellowshipGroupId?: string;
  householdId?: string;
  teamId?: string;
  isFirstTimer?: boolean;
  gender?: Gender;
  visitorJourneyStage?: VisitorJourneyStage;
  includeArchived?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateMemberRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  email?: string;
  dateOfBirth?: string;
  weddingAnniversary?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  householdId?: string;
  departmentId?: string;
  fellowshipGroupId?: string;
  membershipStatusId?: string;
  preferredContactMethod?: PreferredContactMethod;
  preferredLanguage?: string;
  lastAttendanceDate?: string;
  communicationConsentEmail?: boolean;
  communicationConsentSms?: boolean;
  doNotContact?: boolean;
  generalNotes?: string;
  pastoralNotes?: string;
  source?: MemberSource;
  isFirstTimer?: boolean;
  firstVisitDate?: string;
  bornAgainStatus?: string;
  inviterName?: string;
  inviterPhone?: string;
  visitorJourneyStage?: VisitorJourneyStage;
  profileImageUrl?: string;
}

export type UpdateMemberRequest = Partial<CreateMemberRequest>;

export interface VerifyContactRequest {
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'FAILED' | 'NEEDS_UPDATE';
  phoneVerified?: boolean;
  emailVerified?: boolean;
  verificationSource?: string;
  notes?: string;
}

export interface MergeMembersRequest {
  primaryMemberId: string;
  duplicateMemberId: string;
}

export interface ImportMembersRequest {
  filename: string;
  mapping?: Record<string, string>;
  rows: Record<string, string | undefined>[];
}

export interface ImportError {
  id: string;
  importId: string;
  rowNumber: number;
  errorMessage: string;
  rawRowJson: string;
}

export interface ImportRecord {
  id: string;
  filename: string;
  status: string;
  mappingJson?: string | null;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  createdById?: string | null;
  createdAt: string;
  errors?: ImportError[];
  _count?: { errors?: number };
}

/** A group of members that share a matching phone/email/name+DOB signature. */
export interface DuplicateCandidate {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  phonePrimary: string | null;
  email: string | null;
  dateOfBirth: string | null;
  createdAt: string;
}

export interface DuplicateGroup {
  matchType: 'PHONE' | 'EMAIL' | 'NAME_DOB';
  matchValue: string;
  members: DuplicateCandidate[];
}
