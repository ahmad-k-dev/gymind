import { create } from 'zustand';
import { extractApiErrorMessage } from '../../services/api/errors';
import { getMembershipDetailsApi, getMyMembershipsApi } from '../../services/api/membershipApi';
import type { BackendMembershipDisplayDto, BackendMembershipSummaryDto } from '../../services/api/types';

interface MembershipCard {
  membershipId: string;
  membershipIdDisplay: string;
  badgeText: string;
  gymName: string;
  branchName: string;
  expiresAtLabel: string;
  statusText: string;
}

interface MembershipState {
  card: MembershipCard | null;
  loading: boolean;
  error: string;
  hydrateMembershipCard: () => Promise<void>;
}

function toMembershipIdDisplay(value: string): string {
  const compact = value.replace(/-/g, '').toUpperCase();
  if (compact.length < 8) return `#${compact}`;
  return `#${compact.slice(0, 4)}-${compact.slice(4, 8)}`;
}

function toDateLabel(iso?: string | null): string {
  if (!iso) return 'No expiry';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return 'No expiry';
  return dt.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function inferBadge(details: BackendMembershipDisplayDto | null, summary: BackendMembershipSummaryDto): string {
  const raw = (details?.description ?? '').toLowerCase();
  if (raw.includes('elite')) return 'ELITE MEMBER';
  if (raw.includes('platinum')) return 'PLATINUM MEMBER';
  if (raw.includes('gold')) return 'GOLD MEMBER';
  if (raw.includes('basic')) return 'BASIC MEMBER';
  return summary.isActive ? 'ACTIVE MEMBER' : 'INACTIVE';
}

function toCard(summary: BackendMembershipSummaryDto, details: BackendMembershipDisplayDto | null): MembershipCard {
  return {
    membershipId: summary.membershipID,
    membershipIdDisplay: toMembershipIdDisplay(summary.membershipID),
    badgeText: inferBadge(details, summary),
    gymName: details?.gymName ?? summary.gymName,
    branchName: details?.branchName ?? 'Main Branch',
    expiresAtLabel: toDateLabel(details?.expiryDate ?? summary.expiryDate),
    statusText: summary.isActive ? 'Active' : 'Inactive',
  };
}

export const useMembership = create<MembershipState>((set) => ({
  card: null,
  loading: false,
  error: '',

  hydrateMembershipCard: async () => {
    set({ loading: true, error: '' });
    try {
      const memberships = await getMyMembershipsApi();
      const selected = memberships.find((item) => item.isActive) ?? memberships[0];
      if (!selected) {
        set({ loading: false, card: null, error: '' });
        return;
      }

      let details: BackendMembershipDisplayDto | null = null;
      try {
        details = await getMembershipDetailsApi(selected.membershipID);
      } catch {
        details = null;
      }

      set({
        card: toCard(selected, details),
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: extractApiErrorMessage(error, 'Unable to load membership right now.'),
      });
    }
  },
}));
