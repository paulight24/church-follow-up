import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import type { AxiosError } from 'axios';
import api from '@/config/api';
import type { User, UserRole } from '@/types';
import type { LoginResponse } from '@/types/auth';

// `api`'s response interceptor (src/config/api.ts) hard-redirects the whole
// page to /login whenever ANY request 401s and there's no refresh token
// stored yet. That's the right behavior for a session that expires mid-use,
// but a wrong-password attempt on the login form itself is also a plain 401
// with no refresh token (the user isn't signed in yet) -- routing it through
// that interceptor means the login page silently reloads instead of showing
// "Invalid email or password", wiping the form and the error message before
// the user ever sees it. Use a bare axios client for just this call,
// replicating the envelope-unwrap / error-normalization `api` does, so a
// failed login surfaces inline instead of triggering that redirect.
const rawAuthClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  try {
    const { data: envelope } = await rawAuthClient.post<{ success: boolean; data: LoginResponse }>(
      '/auth/login',
      { email, password },
    );
    return envelope.data;
  } catch (err) {
    const error = err as AxiosError;
    const body = error.response?.data as
      | { error?: { message?: string; details?: Record<string, string[]> } }
      | undefined;
    if (body?.error && error.response) {
      (error.response as { data: unknown }).data = {
        message: body.error.message,
        statusCode: error.response.status,
        errors: body.error.details,
      };
    }
    throw error;
  }
}

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasPermission: (code: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  /**
   * Adopt an already-issued session (tokens + user) without hitting
   * /auth/login. Used by the accept-invite flow: that endpoint sets the
   * member's password and returns a normal auth session in one call, so we
   * just need to store it and land them signed in - no second login round trip.
   */
  setSession: (data: LoginResponse) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email, password);

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  }, []);

  const setSession = useCallback((data: LoginResponse) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    window.location.href = '/login';
  }, []);

  const refreshToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      setUser(null);
      return;
    }

    try {
      const { data } = await api.post<LoginResponse>('/auth/refresh', {
        refreshToken: storedRefreshToken,
      });

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback(
    (code: string): boolean => {
      if (!user) return false;
      if (user.roles.some((r) => r.code === 'SUPER_ADMIN')) return true;
      return user.permissions.includes(code);
    },
    [user],
  );

  const hasRole = useCallback(
    (role: UserRole): boolean => {
      if (!user) return false;
      return user.roles.some((r) => r.code === role);
    },
    [user],
  );

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await api.get<User>('/auth/me');
        setUser(data);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      refreshToken,
      hasPermission,
      hasRole,
      setSession,
    }),
    [user, isLoading, isAuthenticated, login, logout, refreshToken, hasPermission, hasRole, setSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
