import type { AxiosResponse } from 'axios';
import type {
  FollowUpTask,
  TaskListFilters,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateInteractionRequest,
  FollowUpInteraction,
  ReassignTaskRequest,
  BulkReassignRequest,
  NonCompletionFeedbackRequest,
  NonCompletionFeedback,
  NonCompletionReason,
} from '@/types/followUp';
import type { PaginatedResponse } from '@/types';
import api from '@/config/api';

export const followUpTasksApi = {
  getTasks(filters?: TaskListFilters): Promise<AxiosResponse<PaginatedResponse<FollowUpTask>>> {
    return api.get('/follow-up-tasks', { params: filters });
  },

  getNonCompletionReasons(): Promise<AxiosResponse<NonCompletionReason[]>> {
    return api.get('/follow-up-tasks/non-completion-reasons');
  },

  getTask(id: string): Promise<AxiosResponse<FollowUpTask>> {
    return api.get(`/follow-up-tasks/${id}`);
  },

  createTask(data: CreateTaskRequest): Promise<AxiosResponse<FollowUpTask>> {
    return api.post('/follow-up-tasks', data);
  },

  updateTask(id: string, data: UpdateTaskRequest): Promise<AxiosResponse<FollowUpTask>> {
    return api.patch(`/follow-up-tasks/${id}`, data);
  },

  deleteTask(id: string): Promise<AxiosResponse<void>> {
    return api.delete(`/follow-up-tasks/${id}`);
  },

  getInteractions(taskId: string): Promise<AxiosResponse<FollowUpInteraction[]>> {
    return api.get(`/follow-up-tasks/${taskId}/interactions`);
  },

  createInteraction(
    taskId: string,
    data: CreateInteractionRequest,
  ): Promise<AxiosResponse<FollowUpInteraction>> {
    return api.post(`/follow-up-tasks/${taskId}/interactions`, data);
  },

  reassignTask(taskId: string, data: ReassignTaskRequest): Promise<AxiosResponse<FollowUpTask>> {
    return api.post(`/follow-up-tasks/${taskId}/reassign`, data);
  },

  bulkReassignTasks(
    data: BulkReassignRequest,
  ): Promise<AxiosResponse<{ reassignedCount: number; taskIds: string[] }>> {
    return api.post('/follow-up-tasks/bulk-reassign', data);
  },

  addNonCompletionFeedback(
    taskId: string,
    data: NonCompletionFeedbackRequest,
  ): Promise<AxiosResponse<NonCompletionFeedback>> {
    return api.post(`/follow-up-tasks/${taskId}/non-completion-feedback`, data);
  },
};
