import type { AxiosResponse } from 'axios';
import api from '@/config/api';
import type { PaginatedResponse } from '@/types';
import type {
  CreateEventRequest,
  EventListFilters,
  EventRecord,
  EventRegistration,
  EventRegistrationExportRow,
  UpdateEventRequest,
  ReviewRegistrationPayload,
  EventInviteLink,
  CreateInviteLinkRequest,
  InviteLinkSummary,
  ReferralConflict,
} from '@/types/event';

export interface AnnounceTestResult {
  results: Array<{ to: string; status: 'SENT' | 'FAILED' | 'SIMULATED'; reason?: string }>;
  eligibleForFullSend: number;
}

export interface EventCampaign {
  enabled: boolean;
  audience: 'all_members';
  subject?: string;
  note?: string;
  flierUrls?: string[];
  sent: { announce?: string; T3?: string; T1?: string; DAY_OF?: string };
}

export interface AnnounceJob {
  eventId: string;
  channel: 'email' | 'sms';
  startedAt: string;
  finishedAt: string | null;
  total: number;
  sent: number;
  failed: number;
  simulated: number;
  failures: Array<{ to: string; reason: string }>;
}

export const eventsApi = {
  getEvents(filters?: EventListFilters): Promise<AxiosResponse<PaginatedResponse<EventRecord>>> {
    return api.get('/events', { params: filters });
  },

  getEvent(id: string): Promise<AxiosResponse<EventRecord>> {
    return api.get(`/events/${id}`);
  },

  createEvent(data: CreateEventRequest): Promise<AxiosResponse<EventRecord>> {
    return api.post('/events', data);
  },

  updateEvent(id: string, data: UpdateEventRequest): Promise<AxiosResponse<EventRecord>> {
    return api.patch(`/events/${id}`, data);
  },

  deleteEvent(id: string): Promise<AxiosResponse<null>> {
    return api.delete(`/events/${id}`);
  },

  publishEvent(id: string): Promise<AxiosResponse<EventRecord>> {
    return api.post(`/events/${id}/publish`);
  },

  unpublishEvent(id: string): Promise<AxiosResponse<EventRecord>> {
    return api.post(`/events/${id}/unpublish`);
  },

  announceTest(
    id: string,
    body: { emails: string[]; flierUrls?: string[]; note?: string; subject?: string }
  ): Promise<AxiosResponse<AnnounceTestResult>> {
    return api.post(`/events/${id}/announce/test`, body);
  },

  announceSend(
    id: string,
    body: { channel: 'email' | 'sms'; flierUrls?: string[]; note?: string; subject?: string; confirm: true }
  ): Promise<AxiosResponse<AnnounceJob>> {
    return api.post(`/events/${id}/announce`, body);
  },

  announceStatus(id: string, channel: 'email' | 'sms'): Promise<AxiosResponse<AnnounceJob | null>> {
    return api.get(`/events/${id}/announce/status`, { params: { channel } });
  },

  getCampaign(id: string): Promise<AxiosResponse<EventCampaign | null>> {
    return api.get(`/events/${id}/campaign`);
  },

  toggleReminders(id: string, enabled: boolean): Promise<AxiosResponse<EventCampaign>> {
    return api.post(`/events/${id}/reminders/toggle`, { enabled });
  },

  sendReminderNow(
    id: string,
    offset: 'T3' | 'T1' | 'DAY_OF'
  ): Promise<AxiosResponse<{ skipped?: string; total?: number; sent?: number; failed?: number; simulated?: number }>> {
    return api.post(`/events/${id}/reminders/send`, { offset });
  },

  getRegistrations(
    id: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<AxiosResponse<PaginatedResponse<EventRegistration>>> {
    return api.get(`/events/${id}/registrations`, { params });
  },

  /** Records what the team decided about one submission. */
  reviewRegistration(
    id: string,
    registrationId: string,
    data: ReviewRegistrationPayload,
  ): Promise<AxiosResponse<EventRegistration>> {
    return api.patch(`/events/${id}/registrations/${registrationId}/review`, data);
  },

  getInviteLinks(id: string): Promise<AxiosResponse<EventInviteLink[]>> {
    return api.get(`/events/${id}/invite-links`);
  },
  createInviteLink(id: string, data: CreateInviteLinkRequest): Promise<AxiosResponse<EventInviteLink>> {
    return api.post(`/events/${id}/invite-links`, data);
  },
  updateInviteLink(
    id: string,
    linkId: string,
    data: { active?: boolean; label?: string | null },
  ): Promise<AxiosResponse<EventInviteLink>> {
    return api.patch(`/events/${id}/invite-links/${linkId}`, data);
  },
  getInviteLinkSummary(id: string): Promise<AxiosResponse<InviteLinkSummary>> {
    return api.get(`/events/${id}/invite-links/summary`);
  },
  bulkCreateInviteLinks(id: string, teamId: string): Promise<AxiosResponse<{ created: number; alreadyHad: number; teamName: string }>> {
    return api.post(`/events/${id}/invite-links/bulk`, { teamId });
  },
  notifyInviteLinkOwners(
    id: string,
    channel: 'in_app' | 'email' | 'both' = 'in_app',
  ): Promise<AxiosResponse<{ sent: number; emailed: number; noEmail: number; total: number }>> {
    return api.post(`/events/${id}/invite-links/notify`, { channel });
  },
  getReferralConflicts(id: string): Promise<AxiosResponse<ReferralConflict[]>> {
    return api.get(`/events/${id}/referral-conflicts`);
  },
  honourReferral(id: string, registrationId: string): Promise<AxiosResponse<null>> {
    return api.post(`/events/${id}/registrations/${registrationId}/honour-referral`);
  },

  /** Flat, CSV-ready rows for every registration - backs the "Export CSV" button. */
  exportRegistrations(id: string): Promise<AxiosResponse<EventRegistrationExportRow[]>> {
    return api.get(`/events/${id}/registrations/export`);
  },
};
