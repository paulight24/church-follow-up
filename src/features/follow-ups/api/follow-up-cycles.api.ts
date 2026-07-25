import type { AxiosResponse } from 'axios';
import type {
  FollowUpCycle,
  FollowUpCycleDetail,
  CreateCycleRequest,
  UpdateCycleRequest,
  CloseCycleRequest,
  RolloverResult,
  CycleStatus,
} from '@/types/followUp';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

interface CycleListFilters {
  status?: CycleStatus;
  page?: number;
  pageSize?: number;
}

export const followUpCyclesApi = {
  getCycles(filters?: CycleListFilters): Promise<AxiosResponse<PaginatedResponse<FollowUpCycle>>> {
    return api.get('/follow-up-cycles', { params: filters });
  },

  getCycle(id: string): Promise<AxiosResponse<FollowUpCycleDetail>> {
    return api.get(`/follow-up-cycles/${id}`);
  },

  createCycle(data: CreateCycleRequest): Promise<AxiosResponse<FollowUpCycle>> {
    return api.post('/follow-up-cycles', data);
  },

  updateCycle(id: string, data: UpdateCycleRequest): Promise<AxiosResponse<FollowUpCycle>> {
    return api.patch(`/follow-up-cycles/${id}`, data);
  },

  activateCycle(id: string): Promise<AxiosResponse<FollowUpCycle>> {
    return api.post(`/follow-up-cycles/${id}/activate`);
  },

  closeCycle(
    id: string,
    data?: CloseCycleRequest,
  ): Promise<AxiosResponse<{ cycle: FollowUpCycle; rollover: RolloverResult | null }>> {
    return api.post(`/follow-up-cycles/${id}/close`, data ?? {});
  },

  rolloverTasks(id: string, toCycleId: string): Promise<AxiosResponse<RolloverResult>> {
    return api.post(`/follow-up-cycles/${id}/rollover`, { toCycleId });
  },
};
