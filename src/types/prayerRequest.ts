export type PrayerRequestStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'PRAYED'
  | 'FOLLOW_UP_NEEDED'
  | 'TESTIMONY_RECEIVED'
  | 'CLOSED';

export type ConfidentialityLevel = 'STANDARD' | 'CONFIDENTIAL' | 'PASTOR_ONLY';

export type PrayerRequestSource =
  | 'QR_FORM'
  | 'MOBILE_FORM'
  | 'PAPER'
  | 'PORTAL'
  | 'CALL'
  | 'USHER'
  | 'PASTOR'
  | 'EMAIL'
  | 'SMS';

export interface PrayerCategory {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface PrayerRequestMemberRef {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phonePrimary?: string | null;
}

export interface PrayerRequestStaffRef {
  id: string;
  firstName: string;
  lastName: string;
}

/**
 * `request` is the decrypted prayer text. It is only populated by the API
 * when the request is STANDARD confidentiality, or the caller holds
 * `prayer_requests.view_confidential` for CONFIDENTIAL/PASTOR_ONLY items;
 * otherwise it is `null` and `requestRedacted` is `true`.
 */
export interface PrayerRequest {
  id: string;
  memberId: string | null;
  member: PrayerRequestMemberRef | null;
  guestFirstName: string | null;
  guestLastName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  categoryId: string | null;
  category: PrayerCategory | null;
  request: string | null;
  requestRedacted: boolean;
  confidentialityLevel: ConfidentialityLevel;
  preferredContactMethod: string | null;
  wantsCall: boolean;
  wantsPastoralContact: boolean;
  source: PrayerRequestSource | null;
  assignedToId: string | null;
  assignedTo: PrayerRequestStaffRef | null;
  createdById: string | null;
  createdBy: PrayerRequestStaffRef | null;
  status: PrayerRequestStatus;
  followUpDate: string | null;
  prayedAt: string | null;
  testimonyReceived: boolean;
  testimony: string | null;
  consentToRetain: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrayerRequestListFilters {
  status?: PrayerRequestStatus | '';
  categoryId?: string;
  memberId?: string;
  assignedToId?: string;
  confidentialityLevel?: ConfidentialityLevel | '';
  page?: number;
  pageSize?: number;
}

export interface CreatePrayerRequestData {
  memberId?: string;
  guestFirstName?: string;
  guestLastName?: string;
  guestPhone?: string;
  guestEmail?: string;
  categoryId?: string;
  request: string;
  confidentialityLevel?: ConfidentialityLevel;
  preferredContactMethod?: string;
  wantsCall?: boolean;
  wantsPastoralContact?: boolean;
  source?: PrayerRequestSource;
  assignedToId?: string;
  consentToRetain?: boolean;
}

export interface UpdatePrayerRequestData {
  memberId?: string;
  guestFirstName?: string;
  guestLastName?: string;
  guestPhone?: string;
  guestEmail?: string;
  categoryId?: string;
  request?: string;
  confidentialityLevel?: ConfidentialityLevel;
  preferredContactMethod?: string;
  wantsCall?: boolean;
  wantsPastoralContact?: boolean;
  source?: PrayerRequestSource;
  assignedToId?: string;
  status?: PrayerRequestStatus;
  followUpDate?: string;
  testimonyReceived?: boolean;
  testimony?: string;
  consentToRetain?: boolean;
}

/** Morning prayer dashboard counts, per GET /prayer-requests/dashboard. */
export interface PrayerDashboard {
  newRequests: number;
  urgent: number;
  notYetPrayed: number;
  prayedToday: number;
  needsFollowUp: number;
  testimonies: number;
  confidentialCount: number;
}
