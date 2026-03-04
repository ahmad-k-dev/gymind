import { apiClient } from './client';
import type { BackendMembershipSummaryDto } from './types';

export async function getMyMembershipsApi(): Promise<BackendMembershipSummaryDto[]> {
  const { data } = await apiClient.get<BackendMembershipSummaryDto[]>('/api/membership/my-memberships');
  return data;
}
