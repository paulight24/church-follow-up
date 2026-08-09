import type { AxiosResponse } from 'axios';
import api from '@/config/api';

export interface InviteMemberRequest {
  memberId: string;
  roleIds?: string[];
  email?: string;
}

export interface InvitedUserSummary {
  id: string;
  email: string;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'DEACTIVATED';
}

export type BulkInviteOutcomeStatus =
  | 'invited'
  | 'skipped-no-email'
  | 'skipped-already-linked'
  | 'skipped-invite-pending'
  | 'skipped-archived'
  | 'failed';

export interface BulkInviteOutcome {
  memberId: string;
  outcome: BulkInviteOutcomeStatus;
  /** Present on 'failed' (why it failed) and useful on skips too. */
  reason?: string;
  userId?: string;
  email?: string;
}

export const invitesApi = {
  /** POST /users/invite - gated server-side on users.create. */
  inviteMember(data: InviteMemberRequest): Promise<AxiosResponse<InvitedUserSummary>> {
    return api.post('/users/invite', data);
  },

  /** POST /users/:id/resend-invite - gated server-side on users.create. `id` is the USER id, not the member id. */
  resendInvite(userId: string): Promise<AxiosResponse<InvitedUserSummary>> {
    return api.post(`/users/${userId}/resend-invite`);
  },

  /** POST /users/invite/bulk - gated server-side on users.create. */
  bulkInvite(memberIds: string[]): Promise<AxiosResponse<BulkInviteOutcome[]>> {
    return api.post('/users/invite/bulk', { memberIds });
  },
};
