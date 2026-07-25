import type { AxiosResponse } from 'axios';
import type {
  FollowUpTask,
  FollowUpCycle,
  FollowUpInteraction,
  TaskStatus,
  TaskPriority,
  Channel,
  Outcome,
} from '@/types/followUp';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  cycleId?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UpdateTaskData {
  status?: TaskStatus;
  priority?: TaskPriority;
  notes?: string | null;
  dueDate?: string;
  assignedToId?: string;
}

interface CreateInteractionData {
  channel: Channel;
  outcome: Outcome;
  notes?: string;
  duration?: number;
  scheduledCallbackDate?: string;
}

interface CreateCycleData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
}

export const followUpsApi = {
  getMyTasks(filters?: TaskFilters): Promise<AxiosResponse<PaginatedResponse<FollowUpTask>>> {
    return api.get('/follow-ups/my-tasks', { params: filters });
  },

  getTask(id: string): Promise<AxiosResponse<FollowUpTask>> {
    return api.get(`/follow-ups/tasks/${id}`);
  },

  updateTask(id: string, data: UpdateTaskData): Promise<AxiosResponse<FollowUpTask>> {
    return api.patch(`/follow-ups/tasks/${id}`, data);
  },

  createInteraction(
    taskId: string,
    data: CreateInteractionData,
  ): Promise<AxiosResponse<FollowUpInteraction>> {
    return api.post(`/follow-ups/tasks/${taskId}/interactions`, data);
  },

  getCycles(): Promise<AxiosResponse<FollowUpCycle[]>> {
    return api.get('/follow-ups/cycles');
  },

  createCycle(data: CreateCycleData): Promise<AxiosResponse<FollowUpCycle>> {
    return api.post('/follow-ups/cycles', data);
  },
};
