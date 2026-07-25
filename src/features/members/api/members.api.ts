import type { AxiosResponse } from 'axios';
import type { MemberFilters, Member, CreateMemberRequest, UpdateMemberRequest } from '@/types/member';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

export const membersApi = {
  getMembers(filters: MemberFilters): Promise<AxiosResponse<PaginatedResponse<Member>>> {
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

  deleteMember(id: string): Promise<AxiosResponse<void>> {
    return api.delete(`/members/${id}`);
  },

  importMembers(file: File): Promise<AxiosResponse<{ imported: number; errors: number }>> {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/members/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getDuplicates(): Promise<AxiosResponse<{ pairs: Array<{ member1: Member; member2: Member; confidence: number }> }>> {
    return api.get('/members/duplicates');
  },

  mergeDuplicates(keepId: string, mergeId: string): Promise<AxiosResponse<Member>> {
    return api.post('/members/merge', { keepId, mergeId });
  },
};
