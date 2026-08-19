import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import type { EventRegistrationAnswers, PublicEvent } from '@/types/event';

interface RegisterResult {
  registrationId: string;
  status: string;
  /** True when this submission updated a registration already on file. */
  alreadyRegistered?: boolean;
}

/**
 * Deliberately a bare axios client, NOT the shared `api` instance from src/config/api.ts.
 * That instance's response interceptor hard-redirects the whole page to /login on any 401
 * with no refresh token in storage - correct for a session expiring mid-use, wrong for a
 * page a visitor opens with no session at all from a QR code on a printed flier. This page
 * must never redirect to /login under any circumstance, so it never touches that interceptor
 * in the first place (mirrors the same reasoning AuthContext's rawAuthClient documents for
 * the login form, and the existing precedent in PublicPrayerRequestPage).
 */
const publicClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Reshape the backend's { error: { code, message, details } } envelope into the plain
// { message, statusCode, errors } shape the rest of the app's error handling expects,
// same normalization `api`'s interceptor does - just without the auth-redirect behavior.
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

export const publicEventsApi = {
  /** `locale` asks the API to translate the event's own custom questions. */
  getEvent(slug: string, locale?: string): Promise<AxiosResponse<PublicEvent>> {
    return publicClient.get(`/public/events/${slug}`, { params: locale && locale !== 'en' ? { locale } : undefined }).then((res) => {
      res.data = (res.data as { success?: boolean; data?: PublicEvent })?.data ?? res.data;
      return res;
    });
  },

  // Backend wraps the submitted answers in an { answers: {...} } envelope
  // (see publicRegisterSchema in events.validation.ts) rather than taking them flat.
  register(slug: string, answers: EventRegistrationAnswers): Promise<AxiosResponse<RegisterResult>> {
    return publicClient.post(`/public/events/${slug}/register`, { answers }).then((res) => {
      res.data = (res.data as { success?: boolean; data?: RegisterResult })?.data ?? res.data;
      return res;
    });
  },
};
