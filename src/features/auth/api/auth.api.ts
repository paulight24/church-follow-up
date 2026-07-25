import api from '@/config/api';
import type { LoginRequest, LoginResponse, ForgotPasswordRequest, ResetPasswordRequest } from '@/types/auth';

export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (data: ForgotPasswordRequest) => api.post('/auth/forgot-password', data),
  resetPassword: (data: ResetPasswordRequest) => api.post('/auth/reset-password', data),
  refreshToken: (refreshToken: string) => api.post<LoginResponse>('/auth/refresh', { refreshToken }),
};
