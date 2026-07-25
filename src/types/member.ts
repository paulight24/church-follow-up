export type MemberStatus =
  | 'NEW'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'FIRST_TIMER'
  | 'SECOND_TIMER'
  | 'REGULAR'
  | 'WORKER';

export type Gender = 'Male' | 'Female' | 'Other';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  email?: string | null;
  phone?: string | null;
  secondaryPhone?: string | null;
  gender?: Gender | null;
  dateOfBirth?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  memberStatus: MemberStatus;
  joinDate?: string | null;
  baptismDate?: string | null;
  salvationDate?: string | null;
  weddingAnniversary?: string | null;
  occupation?: string | null;
  employer?: string | null;
  department?: string | null;
  notes?: string | null;
  photoUrl?: string | null;
  isActive: boolean;
  householdId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MemberFilters {
  search?: string;
  status?: MemberStatus;
  teamId?: string;
  department?: string;
  gender?: Gender;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateMemberRequest {
  firstName: string;
  lastName: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  secondaryPhone?: string;
  gender?: Gender;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  memberStatus?: MemberStatus;
  joinDate?: string;
  baptismDate?: string;
  salvationDate?: string;
  weddingAnniversary?: string;
  occupation?: string;
  employer?: string;
  department?: string;
  notes?: string;
  photoUrl?: string;
  householdId?: string;
}

export type UpdateMemberRequest = Partial<CreateMemberRequest>;
