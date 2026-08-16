import axios from 'axios';
import type { AxiosResponse } from 'axios';
import api from '@/config/api';

// ── shapes (mirror backend live-translation.types.ts) ────────────────

export type LiveSessionStatus = 'READY' | 'LIVE' | 'ENDING' | 'ENDED' | 'FAILED' | 'TIMED_OUT';
export type StreamStatus = 'IDLE' | 'STARTING' | 'LIVE' | 'RECONNECTING' | 'STOPPED' | 'ERROR';
export type InterpreterVoice = 'warm_male' | 'warm_female' | 'neutral_male' | 'neutral_female';

export interface LiveTranslationSettings {
  enabled: boolean;
  provider: string;
  effectiveProvider: string;
  sourceLanguage: string;
  availableTargetLanguages: string[];
  defaultSessionMinutes: number;
  maxSessionMinutes: number;
  idleLanguageTimeoutMinutes: number;
  maxConcurrentLanguages: number;
  saveTranscript: boolean;
  allowPublicListeners: boolean;
  interpreterVoice: InterpreterVoice;
  glossary: string[];
  /** Present on GET /settings: used to build the public listener URL. */
  churchSlug: string;
  churchName: string;
}

export interface StreamState {
  targetLanguage: string;
  status: StreamStatus;
  listeners: number;
  peakListeners: number;
}

export interface LiveSessionSnapshot {
  id: string;
  publicCode: string;
  title: string;
  status: LiveSessionStatus;
  sourceLanguage: string;
  allowCodeSwitching: boolean;
  provider: string;
  translationPaused: boolean;
  startedAt: string | null;
  scheduledEndAt: string | null;
  hardStopAt: string | null;
  remainingSeconds: number | null;
  audioSourceLabel: string | null;
  totalListeners: number;
  peakListeners: number;
  health: { audio: 'excellent' | 'quiet' | 'none'; ai: 'connected' | 'partial' | 'down' | 'idle' };
  streams: StreamState[];
}

export interface CurrentSessionResponse {
  session: LiveSessionSnapshot | null;
  targetLanguages?: string[];
}

export interface SessionSummary {
  id: string;
  title: string;
  status: LiveSessionStatus;
  startedAt: string | null;
  endedAt: string | null;
  endReason: string | null;
  durationSeconds: number;
  languagesUsed: string[];
  peakListeners: number;
  translationSeconds: number;
  perLanguage: Array<{ targetLanguage: string; activeSeconds: number; peakListeners: number }>;
}

export interface SessionListItem {
  id: string;
  title: string;
  status: LiveSessionStatus;
  startedAt: string | null;
  endedAt: string | null;
  endReason: string | null;
  peakListeners: number;
  sourceLanguage: string;
  createdAt: string;
}

export interface TranscriptSegment {
  sequence: number;
  sourceText: string;
  sourceLanguage: string;
  startedAtMs: number | null;
  createdAt: string;
}

export interface UsageReport {
  from: string;
  to: string;
  totalSeconds: number;
  totalMinutes: number;
  byLanguage: Record<string, number>;
  sessions: number;
}

export interface CreateSessionRequest {
  title?: string;
  sourceLanguage?: string;
  allowCodeSwitching?: boolean;
  targetLanguages: string[];
  audioSourceType?: 'BROWSER_MIC' | 'USB_AUDIO' | 'OBS_AUDIO' | 'SYSTEM_AUDIO';
  audioSourceLabel?: string;
}

export interface PublicLiveInfo {
  churchName: string;
  live: {
    publicCode: string;
    title: string;
    status: 'LIVE' | 'READY';
    paused: boolean;
    sourceLanguage: string;
    languages: Array<{
      code: string;
      englishName: string;
      nativeName: string;
      flag: string;
      listeners: number;
    }>;
  } | null;
}

// ── admin calls (authed axios instance, envelope pre-unwrapped) ───────

export const liveTranslationApi = {
  getSettings(): Promise<AxiosResponse<LiveTranslationSettings>> {
    return api.get('/live-translation/settings');
  },
  updateSettings(data: Partial<LiveTranslationSettings>): Promise<AxiosResponse<LiveTranslationSettings>> {
    return api.put('/live-translation/settings', data);
  },
  getCurrent(): Promise<AxiosResponse<CurrentSessionResponse>> {
    return api.get('/live-translation/sessions/current');
  },
  createSession(data: CreateSessionRequest): Promise<AxiosResponse<{ id: string; publicCode: string }>> {
    return api.post('/live-translation/sessions', data);
  },
  startSession(id: string, sessionMinutes?: number): Promise<AxiosResponse<LiveSessionSnapshot>> {
    return api.post(`/live-translation/sessions/${id}/start`, sessionMinutes ? { sessionMinutes } : {});
  },
  extendSession(id: string, minutes: 30 | 60): Promise<AxiosResponse<unknown>> {
    return api.post(`/live-translation/sessions/${id}/extend`, { minutes });
  },
  pauseSession(id: string): Promise<AxiosResponse<{ paused: boolean }>> {
    return api.post(`/live-translation/sessions/${id}/pause`);
  },
  resumeSession(id: string): Promise<AxiosResponse<{ paused: boolean }>> {
    return api.post(`/live-translation/sessions/${id}/resume`);
  },
  endSession(id: string): Promise<AxiosResponse<SessionSummary>> {
    return api.post(`/live-translation/sessions/${id}/end`);
  },
  getSummary(id: string): Promise<AxiosResponse<SessionSummary>> {
    return api.get(`/live-translation/sessions/${id}/summary`);
  },
  listSessions(limit = 20): Promise<AxiosResponse<SessionListItem[]>> {
    return api.get('/live-translation/sessions', { params: { limit: String(limit) } });
  },
  getTranscript(id: string): Promise<AxiosResponse<TranscriptSegment[]>> {
    return api.get(`/live-translation/sessions/${id}/transcript`);
  },
  getUsage(params?: { from?: string; to?: string }): Promise<AxiosResponse<UsageReport>> {
    return api.get('/live-translation/usage', { params });
  },
  getWsTicket(): Promise<AxiosResponse<{ ticket: string; expiresInSeconds: number }>> {
    return api.post('/live-translation/ws-ticket');
  },
};

// ── public call (BARE axios: the shared instance attaches auth headers and
//    its 401 handler redirects to /login — poison for an anonymous phone) ──

const publicClient = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export async function getPublicLiveInfo(slug: string): Promise<PublicLiveInfo> {
  const { data } = await publicClient.get<{ success: true; data: PublicLiveInfo }>(
    `/public/live/${encodeURIComponent(slug)}`
  );
  return data.data;
}
