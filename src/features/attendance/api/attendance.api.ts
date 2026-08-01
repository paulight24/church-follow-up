import type { AxiosResponse } from 'axios';
import type {
  Service,
  ServiceListFilters,
  CreateServiceRequest,
  UpdateServiceRequest,
  AttendanceRecord,
  MemberAttendanceRecord,
  RecordAttendanceRequest,
  ServiceAttendanceSummaryRow,
  ServiceAttendanceSummaryFilters,
  MemberAttendanceSummaryRow,
  MemberAttendanceSummaryFilters,
  CheckInCodeRequest,
  CheckInCodeResponse,
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

  // ─── Attendance reports (permission `attendance.view_reports`) ──────────

  getAttendanceSummary(
    filters?: ServiceAttendanceSummaryFilters,
  ): Promise<AxiosResponse<PaginatedResponse<ServiceAttendanceSummaryRow>>> {
    return api.get('/services/attendance/summary', { params: filters });
  },

  getAttendanceByMember(
    filters?: MemberAttendanceSummaryFilters,
  ): Promise<AxiosResponse<PaginatedResponse<MemberAttendanceSummaryRow>>> {
    return api.get('/services/attendance/by-member', { params: filters });
  },

  // ─── Per-service QR check-in (permission `services.manage`) ────────────

  generateCheckInCode(
    serviceId: string,
    data?: CheckInCodeRequest,
  ): Promise<AxiosResponse<CheckInCodeResponse>> {
    return api.post(`/services/${serviceId}/check-in-code`, data ?? {});
  },

  disableCheckInCode(serviceId: string): Promise<AxiosResponse<Service>> {
    return api.delete(`/services/${serviceId}/check-in-code`);
  },
};
