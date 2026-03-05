import { apiClient } from './api';
import { API_ENDPOINTS } from './endpoints';
import type { BackendMembershipSummaryDto } from './types';

export async function getMyMembershipsApi(): Promise<BackendMembershipSummaryDto[]> {
  const { data } = await apiClient.get<BackendMembershipSummaryDto[]>(API_ENDPOINTS.membership.myMemberships);
  return data;
}
