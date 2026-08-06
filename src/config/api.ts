import axios from 'axios';
import type { AxiosError } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// The backend wraps every response in an envelope:
//   success:      { success: true, data: T, message?: string }
//   paginated:    { success: true, data: T[], pagination: { total, page, pageSize, totalPages } }
//   error:        { error: { code, message, details?, requestId? } }
// Unwrap these here so every feature's api.ts / TanStack Query hook can work
// with the plain payload shape (PaginatedResponse<T> = { data, meta }).
function unwrapEnvelope(raw: unknown): unknown {
  if (raw === null || typeof raw !== 'object') return raw;
  const body = raw as Record<string, unknown>;

  if ('pagination' in body && Array.isArray(body.data)) {
    const pagination = body.pagination as {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
    return {
      data: body.data,
      meta: {
        total: pagination.total,
        page: pagination.page,
        limit: pagination.pageSize,
        totalPages: pagination.totalPages,
      },
    };
  }

  if ('success' in body && 'data' in body) {
    return body.data;
  }

  return raw;
}

api.interceptors.response.use((response) => {
  response.data = unwrapEnvelope(response.data);
  return response;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
}

// Reshape the backend's { error: { code, message, details, requestId } }
// into the frontend's ApiError shape ({ message, statusCode, errors }) so
// `error.response.data.message` / `.errors` work everywhere consumers check them.
function normalizeError(error: AxiosError): AxiosError {
  const body = error.response?.data as
    | { error?: { code?: string; message?: string; details?: Record<string, string[]> } }
    | undefined;
  if (body?.error) {
    (error.response as { data: unknown }).data = {
      message: body.error.message,
      statusCode: error.response?.status ?? 500,
      errors: body.error.details,
      code: body.error.code,
    };
  }
  return error;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    normalizeError(error);
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean });

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data: envelope } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken },
        );

        const { accessToken, refreshToken: newRefreshToken } = envelope.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
