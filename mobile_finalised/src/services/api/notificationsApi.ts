import { apiClient } from './api';
import { API_ENDPOINTS } from './endpoints';
import type { BackendNotificationDto } from './types';

export async function getMyNotificationsApi(): Promise<BackendNotificationDto[]> {
  const { data } = await apiClient.get<BackendNotificationDto[]>(API_ENDPOINTS.notifications.me);
  return data;
}

export async function markNotificationAsReadApi(notificationId: string): Promise<void> {
  await apiClient.patch(API_ENDPOINTS.notifications.markAsRead(notificationId));
}
