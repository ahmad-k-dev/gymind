import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import type { RefreshTokenRequestDto, TokenExchangeRequestDto } from './types';

const DEFAULT_API_BASE_URL = 'http://localhost:7179';
const TOKEN_STORAGE_KEY = 'Token';
const REFRESH_TOKEN_STORAGE_KEY = 'RefreshToken';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<TokenExchangeRequestDto> | null = null;

export async function setStoredTokens(token: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
  await SecureStore.setItemAsync(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
}

export async function clearStoredTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_STORAGE_KEY);
}

export async function getStoredTokens(): Promise<{ token: string | null; refreshToken: string | null }> {
  const [token, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_STORAGE_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_STORAGE_KEY),
  ]);

  return { token, refreshToken };
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { useAuth } = await import('../../store/auth');
  const token = useAuth.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest || originalRequest._retry || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const { useAuth } = await import('../../store/auth');
    const state = useAuth.getState();

    if (!state.token || !state.refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        const payload: RefreshTokenRequestDto = {
          Token: state.token,
          RefreshToken: state.refreshToken,
        };

        refreshPromise = apiClient
          .post<TokenExchangeRequestDto>('/api/auth/refresh', payload)
          .then((response) => response.data)
          .finally(() => {
            refreshPromise = null;
          });
      }

      const refreshed = await refreshPromise;
      await state.setTokens(refreshed.Token, refreshed.RefreshToken);
      originalRequest.headers.Authorization = `Bearer ${refreshed.Token}`;

      return apiClient.request(originalRequest);
    } catch (refreshError) {
      await state.logout();
      return Promise.reject(refreshError);
    }
  }
);
