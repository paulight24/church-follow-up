import type { AxiosResponse } from 'axios';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

// Minimal user shape for "assign to" pickers. Requires `users.view` on the
// backend (GET /users) - callers without that permission will get a
// 403, so pickers built on this should be gated with usePermission first.
export interface UserLookup {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function searchUsers(search?: string): Promise<AxiosResponse<PaginatedResponse<UserLookup>>> {
  return api.get('/users', { params: { search, pageSize: 25 } });
}
