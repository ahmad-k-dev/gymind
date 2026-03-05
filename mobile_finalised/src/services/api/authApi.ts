import { apiClient } from './api';
import { API_ENDPOINTS } from './endpoints';
import type {
  CreateUserDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  TokenExchangeRequestDto,
} from './types';

export async function loginApi(payload: LoginRequestDto): Promise<TokenExchangeRequestDto> {
  const { data } = await apiClient.post<TokenExchangeRequestDto>(API_ENDPOINTS.auth.login, payload);
  return data;
}

export async function registerApi(payload: CreateUserDto): Promise<void> {
  await apiClient.post(API_ENDPOINTS.auth.register, payload);
}

export async function refreshApi(payload: RefreshTokenRequestDto): Promise<TokenExchangeRequestDto> {
  const { data } = await apiClient.post<TokenExchangeRequestDto>(API_ENDPOINTS.auth.refresh, payload);
  return data;
}

export async function requestResetApi(_email: string): Promise<void> {
  throw new Error('Password reset is not available yet. Please contact support.');
}

export async function resetPasswordApi(_token: string, _newPassword: string): Promise<void> {
  throw new Error('Password reset is not available yet. Please contact support.');
}
