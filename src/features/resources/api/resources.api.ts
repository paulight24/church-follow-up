import type { AxiosResponse } from 'axios';
import api from '@/config/api';
import type { ResourceItemDraft, ResourcePage, ResourcePageStatus } from '@/types/resource';

export interface ResourcePagePayload {
  title: string;
  slug: string;
  intro?: string | null;
  contactNote?: string | null;
  heroImageAssetId?: string | null;
  items?: ResourceItemDraft[];
}

export const resourcesApi = {
  list(status?: ResourcePageStatus): Promise<AxiosResponse<ResourcePage[]>> {
    return api.get('/resource-pages', { params: status ? { status } : undefined });
  },
  get(id: string): Promise<AxiosResponse<ResourcePage>> {
    return api.get(`/resource-pages/${id}`);
  },
  create(data: ResourcePagePayload): Promise<AxiosResponse<ResourcePage>> {
    return api.post('/resource-pages', data);
  },
  update(id: string, data: Partial<ResourcePagePayload>): Promise<AxiosResponse<ResourcePage>> {
    return api.patch(`/resource-pages/${id}`, data);
  },
  publish(id: string): Promise<AxiosResponse<ResourcePage>> {
    return api.post(`/resource-pages/${id}/publish`);
  },
  unpublish(id: string): Promise<AxiosResponse<ResourcePage>> {
    return api.post(`/resource-pages/${id}/unpublish`);
  },
  remove(id: string): Promise<AxiosResponse<null>> {
    return api.delete(`/resource-pages/${id}`);
  },
};
