import type { AxiosResponse } from 'axios';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

// Minimal lookup shapes for the escalation form's member/assignee pickers.
// `@/types/member.ts` does not match the real backend response shape (out of
// scope to fix here), so we keep narrow local types covering just what a
// picker needs.

export interface MemberLookup {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  phonePrimary?: string | null;
}

export interface UserLookup {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function searchMembers(search: string): Promise<AxiosResponse<PaginatedResponse<MemberLookup>>> {
  return api.get('/members', { params: { search, pageSize: 10 } });
}

/** Requires `users.view` on the backend - gate pickers built on this with usePermission first. */
export function searchUsers(search?: string): Promise<AxiosResponse<PaginatedResponse<UserLookup>>> {
  return api.get('/users', { params: { search, pageSize: 25 } });
}
