import type { AxiosResponse } from 'axios';
import type {
  MemberListFilters,
  Member,
  CreateMemberRequest,
  UpdateMemberRequest,
  VerifyContactRequest,
  MemberContactVerification,
  ImportMembersRequest,
  ImportRecord,
  DuplicateGroup,
} from '@/types/member';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

/** What `GET /members/lookup` returns: enough to pick a person, no more. */
export interface MemberLookupResult {
  id: string;
  displayName: string;
  /** Last four digits of the primary phone, for telling two same-names apart. */
  phoneHint: string | null;
}

export const membersApi = {
  getMembers(filters: MemberListFilters): Promise<AxiosResponse<PaginatedResponse<Member>>> {
    return api.get('/members', { params: filters });
  },

  /**
   * Find one person by name in order to act on them. For roles that may reach
   * anyone (ushers at the door, Foundation School teachers enrolling) without
   * being able to browse the roster. Returns nothing for a term under two
   * characters.
   */
  lookup(q: string): Promise<AxiosResponse<MemberLookupResult[]>> {
    return api.get('/members/lookup', { params: { q } });
  },

  getMember(id: string): Promise<AxiosResponse<Member>> {
    return api.get(`/members/${id}`);
  },

  createMember(data: CreateMemberRequest): Promise<AxiosResponse<Member>> {
    return api.post('/members', data);
  },

  updateMember(id: string, data: UpdateMemberRequest): Promise<AxiosResponse<Member>> {
    return api.patch(`/members/${id}`, data);
  },

  archiveMember(id: string): Promise<AxiosResponse<null>> {
    return api.delete(`/members/${id}`);
  },

  restoreMember(id: string): Promise<AxiosResponse<Member>> {
    return api.post(`/members/${id}/restore`);
  },

  getMissingContact(params?: { page?: number; pageSize?: number }): Promise<AxiosResponse<PaginatedResponse<Member>>> {
    return api.get('/members/missing-contact', { params });
  },

  verifyContact(id: string, data: VerifyContactRequest): Promise<AxiosResponse<MemberContactVerification>> {
    return api.post(`/members/${id}/verify-contact`, data);
  },

  getContactVerifications(id: string): Promise<AxiosResponse<MemberContactVerification[]>> {
    return api.get(`/members/${id}/contact-verifications`);
  },

  getPossibleDuplicates(): Promise<AxiosResponse<DuplicateGroup[]>> {
    return api.get('/members/possible-duplicates');
  },

  mergeMembers(primaryMemberId: string, duplicateMemberId: string): Promise<AxiosResponse<Member>> {
    return api.post('/members/merge', { primaryMemberId, duplicateMemberId });
  },

  importMembers(data: ImportMembersRequest): Promise<AxiosResponse<ImportRecord>> {
    return api.post('/members/import', data);
  },

  getImports(params?: { page?: number; pageSize?: number }): Promise<AxiosResponse<PaginatedResponse<ImportRecord>>> {
    return api.get('/members/imports', { params });
  },

  getImport(id: string): Promise<AxiosResponse<ImportRecord>> {
    return api.get(`/members/imports/${id}`);
  },
};
