import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import type { RefreshTokenRequestDto, TokenExchangeRequestDto } from './types';
import { API_ENDPOINTS } from './endpoints';
import { getAuthTokens } from './tokenProvider';

// On device: localhost points to the phone itself.
const DEFAULT_API_BASE_URL = 'http://192.168.0.108:7179';

function normalizeBaseUrl(base: string) {
  const trimmed = base.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const RAW_BASE = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
const API_BASE_URL = normalizeBaseUrl(RAW_BASE);

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

const refreshClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<TokenExchangeRequestDto> | null = null;

type AuthContext = {
  setTokens: (token: string, refreshToken: string, userId?: string | null) => Promise<void>;
  logout: () => Promise<void>;
};

let authContext: AuthContext | null = null;

export function registerAuthContext(context: AuthContext): void {
  authContext = context;
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { token } = await getAuthTokens();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (!originalRequest || originalRequest._retry || error.response?.status !== 401) {
      if (__DEV__) {
        console.warn('[api] request failed', {
          status: error.response?.status,
          url: originalRequest?.url,
          method: originalRequest?.method,
        });
      }
      return Promise.reject(error);
    }

    if (!authContext) {
      return Promise.reject(error);
    }

    const tokens = await getAuthTokens();
    if (!tokens.token || !tokens.refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        const payload: RefreshTokenRequestDto = {
          Token: tokens.token,
          RefreshToken: tokens.refreshToken,
        };

        refreshPromise = refreshClient
          .post<TokenExchangeRequestDto>(API_ENDPOINTS.auth.refresh, payload)
          .then((res) => res.data)
          .finally(() => {
            refreshPromise = null;
          });
      }

      const refreshed = await refreshPromise;
      await authContext.setTokens(refreshed.Token, refreshed.RefreshToken, refreshed.UserID);

      originalRequest.headers.Authorization = `Bearer ${refreshed.Token}`;
      return apiClient.request(originalRequest);
    } catch (refreshError) {
      await authContext.logout();
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
