import type { AxiosResponse } from 'axios';
import type {
  Service,
  ServiceListFilters,
  CreateServiceRequest,
  UpdateServiceRequest,
  AttendanceRecord,
  MemberAttendanceRecord,
  RecordAttendanceRequest,
} from '@/types/attendance';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

export const attendanceApi = {
  getServices(filters?: ServiceListFilters): Promise<AxiosResponse<PaginatedResponse<Service>>> {
    return api.get('/services', { params: filters });
  },

  getService(id: string): Promise<AxiosResponse<Service>> {
    return api.get(`/services/${id}`);
  },

  createService(data: CreateServiceRequest): Promise<AxiosResponse<Service>> {
    return api.post('/services', data);
  },

  updateService(id: string, data: UpdateServiceRequest): Promise<AxiosResponse<Service>> {
    return api.patch(`/services/${id}`, data);
  },

  deleteService(id: string): Promise<AxiosResponse<null>> {
    return api.delete(`/services/${id}`);
  },

  getAttendance(
    serviceId: string,
    params?: { page?: number; pageSize?: number; attendanceStatus?: string },
  ): Promise<AxiosResponse<PaginatedResponse<AttendanceRecord>>> {
    return api.get(`/services/${serviceId}/attendance`, { params: { pageSize: 500, ...params } });
  },

  /** Upserts one member's attendance for a service (backend keyed on memberId+serviceId). */
  recordAttendance(
    serviceId: string,
    data: RecordAttendanceRequest,
  ): Promise<AxiosResponse<AttendanceRecord>> {
    return api.post(`/services/${serviceId}/attendance`, data);
  },

  getMemberAttendance(memberId: string): Promise<AxiosResponse<MemberAttendanceRecord[]>> {
    return api.get(`/members/${memberId}/attendance`);
  },
};
