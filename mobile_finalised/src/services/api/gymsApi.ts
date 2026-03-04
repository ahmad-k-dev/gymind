import { apiClient } from './client';
import type { BackendGymDto } from './types';

export async function getAllGymsApi(): Promise<BackendGymDto[]> {
  const { data } = await apiClient.get<BackendGymDto[]>('/api/gyms');
  return data;
}
