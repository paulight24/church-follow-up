import type { AxiosResponse } from 'axios';
import type {
  Team,
  TeamListFilters,
  CreateTeamRequest,
  UpdateTeamRequest,
  TeamUser,
  AddTeamUserRequest,
  UpdateTeamUserRequest,
} from '@/types/team';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

export const teamsApi = {
  getTeams(filters?: TeamListFilters): Promise<AxiosResponse<PaginatedResponse<Team>>> {
    return api.get('/teams', { params: filters });
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

  deleteTeam(id: string): Promise<AxiosResponse<null>> {
    return api.delete(`/teams/${id}`);
  },

  addTeamUser(teamId: string, data: AddTeamUserRequest): Promise<AxiosResponse<TeamUser>> {
    return api.post(`/teams/${teamId}/users`, data);
  },

  updateTeamUser(teamId: string, userId: string, data: UpdateTeamUserRequest): Promise<AxiosResponse<TeamUser>> {
    return api.patch(`/teams/${teamId}/users/${userId}`, data);
  },

  removeTeamUser(teamId: string, userId: string): Promise<AxiosResponse<null>> {
    return api.delete(`/teams/${teamId}/users/${userId}`);
  },
};
