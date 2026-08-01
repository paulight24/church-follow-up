import type { AxiosResponse } from 'axios';
import type {
  ServiceSchedule,
  ServiceScheduleListFilters,
  CreateServiceScheduleRequest,
  UpdateServiceScheduleRequest,
  GenerateSchedulesResult,
} from '@/types/attendance';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

export const serviceSchedulesApi = {
  /** GET /service-schedules — permission `services.view`. */
  getSchedules(
    filters?: ServiceScheduleListFilters,
  ): Promise<AxiosResponse<PaginatedResponse<ServiceSchedule>>> {
    return api.get('/service-schedules', { params: filters });
  },

  getSchedule(id: string): Promise<AxiosResponse<ServiceSchedule>> {
    return api.get(`/service-schedules/${id}`);
  },

  /** permission `services.manage_schedules`. */
  createSchedule(data: CreateServiceScheduleRequest): Promise<AxiosResponse<ServiceSchedule>> {
    return api.post('/service-schedules', data);
  },

  updateSchedule(
    id: string,
    data: UpdateServiceScheduleRequest,
  ): Promise<AxiosResponse<ServiceSchedule>> {
    return api.patch(`/service-schedules/${id}`, data);
  },

  /** Backend returns 409 Conflict if the schedule already generated services — deactivate instead. */
  deleteSchedule(id: string): Promise<AxiosResponse<null>> {
    return api.delete(`/service-schedules/${id}`);
  },

  /** Manual trigger for the nightly generation job. */
  generateNow(): Promise<AxiosResponse<GenerateSchedulesResult>> {
    return api.post('/service-schedules/generate');
  },
};
