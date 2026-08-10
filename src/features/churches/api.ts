import api from '@/config/api';

export interface MyChurch {
  churchId: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  city: string | null;
  status: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  isPrimary: boolean;
}

export interface MyChurchesResponse {
  churches: MyChurch[];
  activeChurchId: string;
}

export async function getMyChurches(): Promise<MyChurchesResponse> {
  const { data } = await api.get<MyChurchesResponse>('/auth/churches');
  return data;
}

export async function switchActiveChurch(churchId: string): Promise<{ accessToken: string; refreshToken: string }> {
  const { data } = await api.post<{ accessToken: string; refreshToken: string }>('/auth/active-church', { churchId });
  return data;
}

// ─── Subscription (free during launch; UI kept low-key, no pricing) ────────

export interface SubscriptionInfo {
  id: string;
  name: string;
  status: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  subscriptionExpiresAt: string | null;
  pendingTierRequest: { id: string; requestedTier: string; status: string; createdAt: string } | null;
}

export async function getSubscription(): Promise<SubscriptionInfo> {
  const { data } = await api.get<SubscriptionInfo>('/billing/subscription');
  return data;
}

export async function requestTierChange(requestedTier: string) {
  const { data } = await api.post('/billing/tier-requests', { requestedTier });
  return data;
}

// ─── Public church registration (landing funnel) ──────────────────────────

export interface RegisterChurchInput {
  churchName: string;
  city?: string;
  stateOrProvince?: string;
  country?: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  adminPhone?: string;
}

export async function registerChurch(input: RegisterChurchInput) {
  const { data } = await api.post<{ churchId: string; name: string; slug: string; status: string }>(
    '/public/churches/register',
    input,
  );
  return data;
}

// ─── Platform console (platform.admin only) ───────────────────────────────

export interface PlatformChurch {
  id: string;
  name: string;
  slug: string;
  churchCode: string;
  city: string | null;
  stateOrProvince: string | null;
  country: string;
  status: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  onboardedAt: string | null;
  createdAt: string;
  memberCount: number;
  userCount: number;
}

export async function listPlatformChurches(status?: string): Promise<PlatformChurch[]> {
  const { data } = await api.get<PlatformChurch[]>('/platform/churches', { params: { status } });
  return data;
}

export async function approveChurch(churchId: string) {
  const { data } = await api.post(`/platform/churches/${churchId}/approve`);
  return data;
}

export async function setChurchStatus(churchId: string, status: string) {
  const { data } = await api.post(`/platform/churches/${churchId}/status`, { status });
  return data;
}

export interface TierRequest {
  id: string;
  requestedTier: string;
  status: string;
  createdAt: string;
  church: { id: string; name: string; slug: string; subscriptionTier: string };
  requestedBy: { id: string; firstName: string; lastName: string; email: string } | null;
}

export async function listTierRequests(status = 'PENDING'): Promise<TierRequest[]> {
  const { data } = await api.get<TierRequest[]>('/platform/tier-requests', { params: { status } });
  return data;
}

export async function decideTierRequest(id: string, decision: 'APPROVED' | 'REJECTED', note?: string) {
  const { data } = await api.post(`/platform/tier-requests/${id}/decide`, { decision, note });
  return data;
}

// ─── Full data export ──────────────────────────────────────────────────────

/**
 * Downloads the church's complete data as a ZIP. Uses the shared api client
 * (auth header + X-Church-Id) with a blob response, then triggers a browser
 * download — works even while the subscription is lapsed.
 */
export async function downloadFullExport(): Promise<void> {
  const response = await api.get('/export/full', { responseType: 'blob' });
  const blob = response.data as Blob;
  const disposition = (response.headers['content-disposition'] as string | undefined) ?? '';
  const match = disposition.match(/filename="?([^";]+)"?/);
  const filename = match?.[1] ?? `church-data-export-${new Date().toISOString().slice(0, 10)}.zip`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
