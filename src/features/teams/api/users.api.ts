import type { AxiosResponse } from 'axios';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

export interface UserLookup {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status?: string;
}

// Lightweight lookup backing team-worker pickers (AssignmentModal, etc).
// The real user management surface lives under /users (not owned by the
// teams feature) but selecting a worker to add to a team requires it.
export const usersLookupApi = {
  getUsers(params?: { search?: string; pageSize?: number }): Promise<AxiosResponse<PaginatedResponse<UserLookup>>> {
    return api.get('/users', { params: { pageSize: 100, ...params } });
  },
};
