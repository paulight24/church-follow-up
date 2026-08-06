import api from '@/config/api';
import type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  InviteInfo,
  AcceptInviteRequest,
} from '@/types/auth';

export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (data: ForgotPasswordRequest) => api.post('/auth/forgot-password', data),
  resetPassword: (data: ResetPasswordRequest) => api.post('/auth/reset-password', data),
  refreshToken: (refreshToken: string) => api.post<LoginResponse>('/auth/refresh', { refreshToken }),
  // Public - no auth header required (the api client attaches one anyway if
  // a stale token happens to be in localStorage, but the backend route
  // ignores it: GET /auth/invite/:token and POST /auth/accept-invite are
  // unauthenticated by contract).
  getInviteInfo: (token: string) => api.get<InviteInfo>(`/auth/invite/${token}`),
  acceptInvite: (data: AcceptInviteRequest) => api.post<LoginResponse>('/auth/accept-invite', data),
};
