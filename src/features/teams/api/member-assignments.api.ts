import type { AxiosResponse } from 'axios';
import type {
  MemberAssignment,
  MemberAssignmentListFilters,
  CreateMemberAssignmentRequest,
  UpdateMemberAssignmentRequest,
} from '@/types/team';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

// Church members assigned to a team's workers for follow-up. This is a
// separate concept from `teamsApi` (which manages the team's staff/workers).
export const memberAssignmentsApi = {
  getMemberAssignments(filters?: MemberAssignmentListFilters): Promise<AxiosResponse<PaginatedResponse<MemberAssignment>>> {
    return api.get('/member-assignments', { params: filters });
  },

  getMemberAssignment(id: string): Promise<AxiosResponse<MemberAssignment>> {
    return api.get(`/member-assignments/${id}`);
  },

  createMemberAssignment(data: CreateMemberAssignmentRequest): Promise<AxiosResponse<MemberAssignment>> {
    return api.post('/member-assignments', data);
  },

  updateMemberAssignment(id: string, data: UpdateMemberAssignmentRequest): Promise<AxiosResponse<MemberAssignment>> {
    return api.patch(`/member-assignments/${id}`, data);
  },

  deactivateMemberAssignment(id: string): Promise<AxiosResponse<MemberAssignment>> {
    return api.delete(`/member-assignments/${id}`);
  },
};
