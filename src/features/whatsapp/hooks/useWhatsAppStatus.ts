import { useQuery } from '@tanstack/react-query';
import { whatsAppApi } from '../api/whatsapp.api';

/**
 * Whether WhatsApp is live (Meta Cloud API configured on the server). Used
 * by ChannelSelector to decide between the "share only" affordance and a
 * real delivered channel, and by SettingsPage's connection panel.
 */
export function useWhatsAppStatus() {
  return useQuery({
    queryKey: ['whatsapp', 'status'],
    queryFn: () => whatsAppApi.getStatus().then((res) => res.data),
    staleTime: 60_000,
  });
}

/**
 * Approved (and not-yet-approved) Meta message templates. Only fetched when
 * `enabled` - the compose flow only needs these once WhatsApp is picked as a
 * delivered channel, and SettingsPage only needs them once configured.
 */
export function useWhatsAppTemplates(enabled = true) {
  return useQuery({
    queryKey: ['whatsapp', 'templates'],
    queryFn: () => whatsAppApi.getTemplates().then((res) => res.data),
    enabled,
    staleTime: 60_000,
  });
}
