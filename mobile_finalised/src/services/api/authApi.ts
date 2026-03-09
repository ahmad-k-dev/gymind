import { apiClient } from './api';
import { API_ENDPOINTS } from './endpoints';
import type {
  CreateUserDto,
  ForgotPasswordResponseDto,
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

export async function requestResetApi(email: string): Promise<ForgotPasswordResponseDto> {
  const { data } = await apiClient.post<ForgotPasswordResponseDto>(API_ENDPOINTS.auth.requestPasswordReset, {
    email,
  });
  return data;
}

export async function resetPasswordApi(token: string, newPassword: string): Promise<void> {
  await apiClient.post(API_ENDPOINTS.auth.resetPassword, {
    token,
    newPassword,
  });
}
