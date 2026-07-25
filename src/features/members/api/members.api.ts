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

export const membersApi = {
  getMembers(filters: MemberListFilters): Promise<AxiosResponse<PaginatedResponse<Member>>> {
    return api.get('/members', { params: filters });
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
