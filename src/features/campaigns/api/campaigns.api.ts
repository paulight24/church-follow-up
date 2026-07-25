import type { AxiosResponse } from 'axios';
import type { PaginatedResponse } from '@/types';
import type {
  Campaign,
  CampaignAnalytics,
  CampaignListFilters,
  CampaignRecipient,
  CreateCampaignRequest,
  SegmentPreview,
  UpdateCampaignRequest,
} from '@/types/campaign';
import api from '@/config/api';

export const campaignsApi = {
  getCampaigns(filters?: CampaignListFilters): Promise<AxiosResponse<PaginatedResponse<Campaign>>> {
    return api.get('/campaigns', { params: filters });
  },

  getCampaign(id: string): Promise<AxiosResponse<Campaign>> {
    return api.get(`/campaigns/${id}`);
  },

  createCampaign(data: CreateCampaignRequest): Promise<AxiosResponse<Campaign>> {
    return api.post('/campaigns', data);
  },

  updateCampaign(id: string, data: UpdateCampaignRequest): Promise<AxiosResponse<Campaign>> {
    return api.patch(`/campaigns/${id}`, data);
  },

  deleteCampaign(id: string): Promise<AxiosResponse<null>> {
    return api.delete(`/campaigns/${id}`);
  },

  previewSegment(id: string): Promise<AxiosResponse<SegmentPreview>> {
    return api.get(`/campaigns/${id}/segment-preview`);
  },

  approveCampaign(id: string): Promise<AxiosResponse<Campaign>> {
    return api.post(`/campaigns/${id}/approve`);
  },

  scheduleCampaign(id: string, scheduledAt: string): Promise<AxiosResponse<Campaign>> {
    return api.post(`/campaigns/${id}/schedule`, { scheduledAt });
  },

  sendCampaign(id: string): Promise<AxiosResponse<Campaign>> {
    return api.post(`/campaigns/${id}/send`);
  },

  cancelCampaign(id: string): Promise<AxiosResponse<Campaign>> {
    return api.post(`/campaigns/${id}/cancel`);
  },

  getRecipients(
    id: string,
    params?: { page?: number; pageSize?: number; status?: string },
  ): Promise<AxiosResponse<PaginatedResponse<CampaignRecipient>>> {
    return api.get(`/campaigns/${id}/recipients`, { params });
  },

  getAnalytics(id: string): Promise<AxiosResponse<CampaignAnalytics>> {
    return api.get(`/campaigns/${id}/analytics`);
  },
};

// ─── Reference-data lookups used by the segment/recipient builder ──────────
// These hit real church-structure endpoints (departments, fellowship groups,
// teams) that already exist on the backend outside the campaigns module.

export interface LookupOption {
  id: string;
  name: string;
}

export const lookupsApi = {
  getDepartments(): Promise<AxiosResponse<PaginatedResponse<LookupOption>>> {
    return api.get('/departments', { params: { pageSize: 100, status: 'ACTIVE' } });
  },

  getFellowshipGroups(): Promise<AxiosResponse<PaginatedResponse<LookupOption>>> {
    return api.get('/fellowship-groups', { params: { pageSize: 100, status: 'ACTIVE' } });
  },

  getTeams(): Promise<AxiosResponse<PaginatedResponse<LookupOption>>> {
    return api.get('/teams', { params: { pageSize: 100, status: 'ACTIVE' } });
  },

  searchMembers(search: string): Promise<
    AxiosResponse<
      PaginatedResponse<{ id: string; firstName: string; lastName: string; email?: string | null }>
    >
  > {
    return api.get('/members', { params: { search, pageSize: 20 } });
  },
};

// ─── Media assets (campaign / encouragement image library) ─────────────────

export interface MediaAsset {
  id: string;
  filename: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  uploadedById?: string | null;
  uploadedBy?: { id: string; firstName: string; lastName: string } | null;
  createdAt: string;
}

/** Backend origin (VITE_API_URL minus the trailing /api/v1) - uploads are served statically from here. */
export const mediaBackendOrigin = (import.meta.env.VITE_API_URL ?? '').replace(/\/api\/v1\/?$/, '');

export function mediaAssetUrl(asset: Pick<MediaAsset, 'storageKey'>): string {
  return `${mediaBackendOrigin}/uploads/${asset.storageKey}`;
}

export const mediaAssetsApi = {
  getMediaAssets(params?: { mimeType?: string; page?: number; pageSize?: number }): Promise<
    AxiosResponse<PaginatedResponse<MediaAsset>>
  > {
    return api.get('/media-assets', { params });
  },

  getMediaAsset(id: string): Promise<AxiosResponse<MediaAsset>> {
    return api.get(`/media-assets/${id}`);
  },

  uploadMediaAsset(file: File): Promise<AxiosResponse<MediaAsset>> {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/media-assets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteMediaAsset(id: string): Promise<AxiosResponse<null>> {
    return api.delete(`/media-assets/${id}`);
  },
};
