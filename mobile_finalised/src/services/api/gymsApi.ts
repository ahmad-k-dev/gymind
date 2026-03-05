import { apiClient } from './api';
import { API_ENDPOINTS } from './endpoints';
import type { BackendGymDto } from './types';

export async function getAllGymsApi(): Promise<BackendGymDto[]> {
  const { data } = await apiClient.get<BackendGymDto[]>(API_ENDPOINTS.gyms.all);
  return data;
}
