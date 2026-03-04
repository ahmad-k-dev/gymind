import { apiClient } from './client';
import type { CreateUserDto, LoginRequestDto, LoginResponseDto } from './types';

export async function loginApi(payload: LoginRequestDto): Promise<LoginResponseDto> {
  const { data } = await apiClient.post<LoginResponseDto>('/api/auth/login', payload);
  return data;
}

export async function registerApi(payload: CreateUserDto): Promise<void> {
  await apiClient.post('/api/auth/register', payload);
}
