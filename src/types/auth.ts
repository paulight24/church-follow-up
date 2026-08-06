import type { User } from './index';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface InviteInfo {
  firstName: string;
  email: string;
}

export interface AcceptInviteRequest {
  token: string;
  password: string;
}
