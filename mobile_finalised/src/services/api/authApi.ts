import { apiClient } from './api';
import type { CreateUserDto, LoginRequestDto, RefreshTokenRequestDto, TokenExchangeRequestDto } from './types';

export async function loginApi(payload: LoginRequestDto): Promise<TokenExchangeRequestDto> {
  const { data } = await apiClient.post<TokenExchangeRequestDto>('/api/auth/login', payload);
  return data;
}

export async function registerApi(payload: CreateUserDto): Promise<void> {
  await apiClient.post('/api/auth/register', payload);
}

export async function refreshApi(payload: RefreshTokenRequestDto): Promise<TokenExchangeRequestDto> {
  const { data } = await apiClient.post<TokenExchangeRequestDto>('/api/auth/refresh', payload);
  return data;
}

export async function logoutApi(): Promise<void> {
  return Promise.resolve();
}

export async function requestResetApi(email: string): Promise<void> {
  await apiClient.post('/api/auth/request-password-reset', { Email: email });
}

export async function resetPasswordApi(token: string, newPassword: string): Promise<void> {
  await apiClient.post('/api/auth/reset-password', { Token: token, NewPassword: newPassword });
}
