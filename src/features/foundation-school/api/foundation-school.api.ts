import type { AxiosResponse } from 'axios';
import type {
  FoundationSchoolCohort,
  FoundationSchoolEnrollment,
  CreateCohortData,
  UpdateCohortData,
  EnrollMemberData,
  UpdateEnrollmentData,
  UpdateClassProgressData,
  FoundationSchoolClassProgress,
  GraduationEligibility,
  EnrollmentListFilters,
} from '@/types/foundationSchool';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

// Lightweight lookup backing the instructor picker in CohortFormModal. The
// real user management surface lives under /users (requires `users.view`,
// not owned by this feature) - mirrors the same pattern used by the teams
// feature's usersLookupApi.
export interface InstructorLookup {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export const instructorLookupApi = {
  searchInstructors(search?: string): Promise<AxiosResponse<PaginatedResponse<InstructorLookup>>> {
    return api.get('/users', { params: { search, pageSize: 25 } });
  },
};

export const foundationSchoolApi = {
  getCohorts(filters?: { status?: string }): Promise<AxiosResponse<FoundationSchoolCohort[]>> {
    return api.get('/foundation-school/cohorts', { params: filters });
  },

  getCohort(id: string): Promise<AxiosResponse<FoundationSchoolCohort>> {
    return api.get(`/foundation-school/cohorts/${id}`);
  },

  createCohort(data: CreateCohortData): Promise<AxiosResponse<FoundationSchoolCohort>> {
    return api.post('/foundation-school/cohorts', data);
  },

  updateCohort(
    id: string,
    data: UpdateCohortData,
  ): Promise<AxiosResponse<FoundationSchoolCohort>> {
    return api.patch(`/foundation-school/cohorts/${id}`, data);
  },

  getEnrollments(
    filters?: EnrollmentListFilters,
  ): Promise<AxiosResponse<PaginatedResponse<FoundationSchoolEnrollment>>> {
    return api.get('/foundation-school/enrollments', { params: filters });
  },

  getEnrollment(id: string): Promise<AxiosResponse<FoundationSchoolEnrollment>> {
    return api.get(`/foundation-school/enrollments/${id}`);
  },

  enrollMember(data: EnrollMemberData): Promise<AxiosResponse<FoundationSchoolEnrollment>> {
    return api.post('/foundation-school/enrollments', data);
  },

  updateEnrollment(
    id: string,
    data: UpdateEnrollmentData,
  ): Promise<AxiosResponse<FoundationSchoolEnrollment>> {
    return api.patch(`/foundation-school/enrollments/${id}`, data);
  },

  getGraduationEligibility(
    id: string,
  ): Promise<AxiosResponse<GraduationEligibility>> {
    return api.get(`/foundation-school/enrollments/${id}/graduation-eligibility`);
  },

  graduateEnrollment(id: string): Promise<AxiosResponse<FoundationSchoolEnrollment>> {
    return api.post(`/foundation-school/enrollments/${id}/graduate`);
  },

  updateClassProgress(
    id: string,
    data: UpdateClassProgressData,
  ): Promise<AxiosResponse<FoundationSchoolClassProgress>> {
    return api.patch(`/foundation-school/class-progress/${id}`, data);
  },
};
