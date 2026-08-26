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

  /** Flat, CSV-ready rows for every registration - backs the "Export CSV" button. */
  exportRegistrations(id: string): Promise<AxiosResponse<EventRegistrationExportRow[]>> {
    return api.get(`/events/${id}/registrations/export`);
  },
};
