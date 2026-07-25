import type { AxiosResponse } from 'axios';
import type {
  CallGuide,
  CallGuideListFilters,
  CreateCallGuideRequest,
  UpdateCallGuideRequest,
  CallGuideVersion,
  CreateVersionRequest,
  CallGuideQuestion,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  CreateCompletionRequest,
} from '../types';
import api from '@/config/api';

export const callGuidesApi = {
  getCallGuides(filters?: CallGuideListFilters): Promise<AxiosResponse<CallGuide[]>> {
    return api.get('/call-guides', { params: filters });
  },

  getCallGuide(id: string): Promise<AxiosResponse<CallGuide>> {
    return api.get(`/call-guides/${id}`);
  },

  createCallGuide(data: CreateCallGuideRequest): Promise<AxiosResponse<CallGuide>> {
    return api.post('/call-guides', data);
  },

  updateCallGuide(id: string, data: UpdateCallGuideRequest): Promise<AxiosResponse<CallGuide>> {
    return api.patch(`/call-guides/${id}`, data);
  },

  getVersions(guideId: string): Promise<AxiosResponse<CallGuideVersion[]>> {
    return api.get(`/call-guides/${guideId}/versions`);
  },

  createVersion(guideId: string, data: CreateVersionRequest): Promise<AxiosResponse<CallGuideVersion>> {
    return api.post(`/call-guides/${guideId}/versions`, data);
  },

  publishVersion(guideId: string, versionId: string): Promise<AxiosResponse<CallGuideVersion>> {
    return api.post(`/call-guides/${guideId}/versions/${versionId}/publish`);
  },

  restoreVersion(guideId: string, versionId: string): Promise<AxiosResponse<CallGuideVersion>> {
    return api.post(`/call-guides/${guideId}/versions/${versionId}/restore`);
  },

  createQuestion(guideId: string, data: CreateQuestionRequest): Promise<AxiosResponse<CallGuideQuestion>> {
    return api.post(`/call-guides/${guideId}/questions`, data);
  },

  updateQuestion(
    guideId: string,
    questionId: string,
    data: UpdateQuestionRequest,
  ): Promise<AxiosResponse<CallGuideQuestion>> {
    return api.patch(`/call-guides/${guideId}/questions/${questionId}`, data);
  },

  deleteQuestion(guideId: string, questionId: string): Promise<AxiosResponse<void>> {
    return api.delete(`/call-guides/${guideId}/questions/${questionId}`);
  },

  createCompletion(data: CreateCompletionRequest): Promise<AxiosResponse<unknown>> {
    return api.post('/call-guides/completions', data);
  },

  getCompletionsForTask(taskId: string): Promise<AxiosResponse<unknown[]>> {
    return api.get(`/call-guides/completions/task/${taskId}`);
  },
};
