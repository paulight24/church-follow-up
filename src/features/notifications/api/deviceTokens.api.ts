import type { AxiosResponse } from 'axios';
import api from '@/config/api';

export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: string;
  createdAt: string;
  lastUsedAt: string;
}

export const deviceTokensApi = {
  register(token: string): Promise<AxiosResponse<DeviceToken>> {
    return api.post('/device-tokens', { token, platform: 'WEB' });
  },
  unregister(token: string): Promise<AxiosResponse<null>> {
    return api.delete(`/device-tokens/${encodeURIComponent(token)}`);
  },
};
