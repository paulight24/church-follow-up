import type { AxiosResponse } from 'axios';
import type { Team, TeamMember, MemberAssignment } from '@/types/team';
import api from '@/config/api';

interface CreateTeamRequest {
  name: string;
  description?: string;
  leaderId: string;
}

interface UpdateTeamRequest {
  name?: string;
  description?: string;
  leaderId?: string;
  isActive?: boolean;
}

interface AssignMemberRequest {
  userId: string;
  role?: 'LEADER' | 'MEMBER';
}

export const teamsApi = {
  getTeams(): Promise<AxiosResponse<Team[]>> {
    return api.get('/teams');
  },

  getTeam(id: string): Promise<AxiosResponse<Team>> {
    return api.get(`/teams/${id}`);
  },

  createTeam(data: CreateTeamRequest): Promise<AxiosResponse<Team>> {
    return api.post('/teams', data);
  },

  updateTeam(id: string, data: UpdateTeamRequest): Promise<AxiosResponse<Team>> {
    return api.patch(`/teams/${id}`, data);
  },

  deleteTeam(id: string): Promise<AxiosResponse<void>> {
    return api.delete(`/teams/${id}`);
  },

  getTeamMembers(teamId: string): Promise<AxiosResponse<TeamMember[]>> {
    return api.get(`/teams/${teamId}/members`);
  },

  assignMember(teamId: string, data: AssignMemberRequest): Promise<AxiosResponse<MemberAssignment>> {
    return api.post(`/teams/${teamId}/assignments`, data);
  },
};
