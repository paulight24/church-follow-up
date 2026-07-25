import type { AxiosResponse } from 'axios';
import type { Department, FellowshipGroup } from '@/types/member';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

// Lightweight lookups backing the Member form's dropdowns. Both endpoints
// live outside the members module but are required to let a user pick a
// department / fellowship group when creating or editing a member.

export const lookupsApi = {
  getDepartments(): Promise<AxiosResponse<PaginatedResponse<Department>>> {
    return api.get('/departments', { params: { pageSize: 100, status: 'ACTIVE' } });
  },

  getFellowshipGroups(): Promise<AxiosResponse<PaginatedResponse<FellowshipGroup>>> {
    return api.get('/fellowship-groups', { params: { pageSize: 100, status: 'ACTIVE' } });
  },
};
