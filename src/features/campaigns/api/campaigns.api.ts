import type { Campaign } from '@/types/campaign';
import api from '@/config/api';

interface CampaignFilters {
  status?: string;
  channel?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface CreateCampaignData {
  name: string;
  subject?: string;
  content: string;
  channel: string;
  scheduledAt?: string;
}

interface UpdateCampaignData {
  name?: string;
  subject?: string;
  content?: string;
  channel?: string;
  status?: string;
  scheduledAt?: string;
}

export const campaignsApi = {
  getCampaigns(filters?: CampaignFilters) {
    return api.get<{ data: Campaign[]; total: number }>('/campaigns', {
      params: filters,
    });
  },

  getCampaign(id: string) {
    return api.get<Campaign>(`/campaigns/${id}`);
  },

  createCampaign(data: CreateCampaignData) {
    return api.post<Campaign>('/campaigns', data);
  },

  updateCampaign(id: string, data: UpdateCampaignData) {
    return api.patch<Campaign>(`/campaigns/${id}`, data);
  },

  deleteCampaign(id: string) {
    return api.delete(`/campaigns/${id}`);
  },

  sendCampaign(id: string) {
    return api.post<Campaign>(`/campaigns/${id}/send`);
  },
};
