import api from '@/config/api';

export type SettingCategory = 'CHURCH_PROFILE' | 'FOLLOW_UP' | 'NOTIFICATIONS' | 'INTEGRATIONS';

export type AllSettings = Record<SettingCategory, Record<string, unknown>>;

export const settingsApi = {
  getAll: () => api.get<AllSettings>('/settings'),
  updateCategory: (category: SettingCategory, values: Record<string, unknown>) =>
    api.patch<Record<string, unknown>>(`/settings/${category}`, values),
};
