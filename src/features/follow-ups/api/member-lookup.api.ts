import type { AxiosResponse } from 'axios';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

// Minimal member shape for typeahead pickers on this feature. The full
// `Member` type in `@/types/member.ts` does not match the real backend
// response shape (out of scope for this feature to fix), so we keep a
// narrow local type covering just what a picker needs.
export interface MemberLookup {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string | null;
  phonePrimary?: string | null;
  email?: string | null;
}

export function searchMembers(search: string): Promise<AxiosResponse<PaginatedResponse<MemberLookup>>> {
  return api.get('/members', { params: { search, pageSize: 10 } });
}
