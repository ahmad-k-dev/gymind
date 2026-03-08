import { apiClient } from './api';
import { API_ENDPOINTS } from './endpoints';
import type { BackendMembershipDisplayDto, BackendMembershipSummaryDto } from './types';

export async function getMyMembershipsApi(): Promise<BackendMembershipSummaryDto[]> {
  const { data } = await apiClient.get<BackendMembershipSummaryDto[]>(API_ENDPOINTS.membership.myMemberships);
  return data;
}

export async function getMembershipDetailsApi(membershipId: string): Promise<BackendMembershipDisplayDto> {
  const { data } = await apiClient.get<BackendMembershipDisplayDto>(API_ENDPOINTS.membership.details(membershipId));
  return data;
}
