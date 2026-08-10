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
