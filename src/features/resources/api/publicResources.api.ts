import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import type { PublicResourcePage } from '@/types/resource';

/**
 * Deliberately a bare axios client, NOT the shared `api` instance: this page
 * is reached with no session at all, and the shared client would attach a
 * stale token and then try to refresh it on the 401 that follows. Mirrors
 * publicEvents.api.ts, which learned the same lesson.
 */
const publicClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

function normalizeError(error: AxiosError): AxiosError {
  const body = error.response?.data as
    | { error?: { code?: string; message?: string; details?: Record<string, string[]> } }
    | undefined;
  if (body?.error && error.response) {
    (error.response as { data: unknown }).data = {
      message: body.error.message,
      statusCode: error.response.status,
      errors: body.error.details,
      code: body.error.code,
    };
  }
  return error;
}

publicClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(normalizeError(error)),
);

export const publicResourcesApi = {
  getPage(slug: string, locale?: string): Promise<AxiosResponse<PublicResourcePage>> {
    return publicClient
      .get(`/public/resources/${slug}`, { params: locale && locale !== 'en' ? { locale } : undefined })
      .then((res) => {
        res.data = (res.data as { success?: boolean; data?: PublicResourcePage })?.data ?? res.data;
        return res;
      });
  },
};
