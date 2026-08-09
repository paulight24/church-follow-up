import type { AxiosResponse } from 'axios';
import type { WhatsAppStatus, WhatsAppTemplate, WhatsAppTemplateSyncResult } from '@/types/whatsapp';
import api from '@/config/api';

export const whatsAppApi = {
  /** GET /whatsapp/status - whether the Meta Cloud API is configured, plus live account details when it is. */
  getStatus(): Promise<AxiosResponse<WhatsAppStatus>> {
    return api.get('/whatsapp/status');
  },

  /** GET /whatsapp/templates - templates already synced from Meta, of any approval status. */
  getTemplates(): Promise<AxiosResponse<WhatsAppTemplate[]>> {
    return api.get('/whatsapp/templates');
  },

  /** POST /whatsapp/templates/sync - refetches the current template list from Meta. */
  syncTemplates(): Promise<AxiosResponse<WhatsAppTemplateSyncResult>> {
    return api.post('/whatsapp/templates/sync');
  },
};
