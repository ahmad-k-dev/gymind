import { apiClient } from './client';
import type { BackendGymSessionHistoryDto } from './types';

export async function checkInApi(payload: { gymBranchID: string; latitude: number; longitude: number }): Promise<void> {
  await apiClient.post('/api/gymsession/check-in', payload);
}

export async function checkOutApi(): Promise<void> {
  await apiClient.post('/api/gymsession/check-out');
}

export async function getMyHistoryApi(): Promise<BackendGymSessionHistoryDto[]> {
  const { data } = await apiClient.get<BackendGymSessionHistoryDto[]>('/api/gymsession/my-history');
  return data;
}
