import { apiClient } from './api';
import { API_ENDPOINTS } from './endpoints';
import type { BackendGymSessionHistoryDto } from './types';

export interface CheckInRequestDto {
  GymBranchID: string;
  Latitude: number;
  Longitude: number;
}

export async function checkInApi(payload: CheckInRequestDto): Promise<void> {
  await apiClient.post(API_ENDPOINTS.session.checkIn, payload);
}

export async function checkOutApi(): Promise<void> {
  await apiClient.post(API_ENDPOINTS.session.checkOut);
}

export async function getMyHistoryApi(): Promise<BackendGymSessionHistoryDto[]> {
  const { data } = await apiClient.get<BackendGymSessionHistoryDto[]>(API_ENDPOINTS.session.myHistory);
  return data;
}
