import type { AxiosResponse } from 'axios';
import api from '@/config/api';
import type { PaginatedResponse } from '@/types';

/** What sms-inbound.service.ts classified the text as. */
export type ReplyIntent = 'STOP' | 'START' | 'HELP' | 'OTHER';

export interface InboundReply {
  id: string;
  channel: 'SMS' | 'WHATSAPP';
  fromNumber: string;
  toNumber: string;
  body: string;
  intent: ReplyIntent;
  receivedAt: string;
  handledAt: string | null;
  /** Null when the sender's number matches no member on file. */
  member: {
    id: string;
    firstName: string;
    lastName: string;
    phonePrimary: string | null;
  } | null;
  handledBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

export type ReplyStatusFilter = 'unhandled' | 'handled' | 'all';

/** The list payload carries `unhandled` on top of the usual pagination. */
export interface RepliesPage extends PaginatedResponse<InboundReply> {
  /** Outstanding replies across the whole inbox, not just this page. */
  unhandled: number;
}

export const repliesApi = {
  /** GET /members/replies — gated server-side on members.view. */
  list(params: {
    status?: ReplyStatusFilter;
    page?: number;
    pageSize?: number;
  }): Promise<AxiosResponse<RepliesPage>> {
    return api.get('/members/replies', { params });
  },

  /** POST /members/replies/:id/handled — toggles; sending it twice un-handles. */
  toggleHandled(id: string): Promise<AxiosResponse<InboundReply>> {
    return api.post(`/members/replies/${id}/handled`);
  },
};
