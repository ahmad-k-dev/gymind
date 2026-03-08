import { apiClient } from './api';
import { API_ENDPOINTS } from './endpoints';
import type { BackendAnnouncementDto } from './types';

export async function getMyAnnouncementsApi(): Promise<BackendAnnouncementDto[]> {
  const { data } = await apiClient.get<BackendAnnouncementDto[]>(API_ENDPOINTS.announcements.me);
  return data;
}
