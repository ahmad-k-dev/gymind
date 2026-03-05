import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosInstance,
} from "axios";
import * as SecureStore from "expo-secure-store";
import type { RefreshTokenRequestDto, TokenExchangeRequestDto } from "./types";

// ✅ IMPORTANT:
// - On device: localhost will be the phone, not your PC.
// - Prefer EXPO_PUBLIC_API_BASE_URL, e.g. "http://192.168.0.108:7179"
const DEFAULT_API_BASE_URL = "http://192.168.0.108:7179";

const TOKEN_STORAGE_KEY = "Token";
const REFRESH_TOKEN_STORAGE_KEY = "RefreshToken";

// If you pass EXPO_PUBLIC_API_BASE_URL without /api, we add it here.
function normalizeBaseUrl(base: string) {
  const trimmed = base.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

const RAW_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

const API_BASE_URL = normalizeBaseUrl(RAW_BASE);

// ✅ Main client used by the app
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

// ✅ Bare client used ONLY for refresh (no interceptors to avoid loops)
const refreshClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<TokenExchangeRequestDto> | null = null;

// -------------------- SecureStore helpers --------------------

export async function setStoredTokens(
  token: string,
  refreshToken: string
): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
  await SecureStore.setItemAsync(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
}

export async function clearStoredTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_STORAGE_KEY);
}

export async function getStoredTokens(): Promise<{
  token: string | null;
  refreshToken: string | null;
}> {
  const [token, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_STORAGE_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_STORAGE_KEY),
  ]);

  return { token, refreshToken };
}

// -------------------- Request interceptor --------------------

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // import/require inside interceptor avoids circular dependency issues
  const { useAuth } = await import("../../store/auth");
  const token = useAuth.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// -------------------- Response interceptor (401 -> refresh) --------------------

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    // Only handle 401 once per request
    if (!originalRequest || originalRequest._retry || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const { useAuth } = await import("../../store/auth");
    const state = useAuth.getState();

    // If we don't have tokens, just fail
    if (!state.token || !state.refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // single-flight refresh: everyone awaits the same promise
      if (!refreshPromise) {
        const payload: RefreshTokenRequestDto = {
          Token: state.token,
          RefreshToken: state.refreshToken,
        };

        refreshPromise = refreshClient
          .post<TokenExchangeRequestDto>("/auth/refresh", payload)
          .then((res) => res.data)
          .finally(() => {
            refreshPromise = null;
          });
      }

      const refreshed = await refreshPromise;

      // Update zustand + (if your setTokens stores securely inside it, great)
      await state.setTokens(refreshed.Token, refreshed.RefreshToken);

      // Update the outgoing request and retry
      originalRequest.headers.Authorization = `Bearer ${refreshed.Token}`;

      return apiClient.request(originalRequest);
    } catch (refreshError) {
      // Refresh failed -> force logout
      await state.logout();
      return Promise.reject(refreshError);
    }
  }
);

// -------------------- Convenience API wrappers (optional) --------------------

export const authApi = {
  login: async (dto: any) => {
    const res = await apiClient.post<TokenExchangeRequestDto>("/auth/login", dto);
    return res.data;
  },
  register: async (dto: any) => {
    const res = await apiClient.post("/auth/register", dto);
    return res.data;
  },
  refresh: async (dto: RefreshTokenRequestDto) => {
    const res = await refreshClient.post<TokenExchangeRequestDto>("/auth/refresh", dto);
    return res.data;
  },
};

export default apiClient;