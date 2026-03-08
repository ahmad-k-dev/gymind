import { create } from 'zustand';
import type { AttendanceDay, LinkedGym, WeeklyActivityPoint } from '../types/stats';
import { getMyHistoryApi } from '../services/api/sessionApi';
import { getMyMembershipsApi } from '../services/api/membershipApi';
import { buildComputedStats, mapLinkedGymFromMembership } from '../services/api/mappers';
import type { Gym } from '../types';

interface StatsStore {
  weeklyActivity: readonly WeeklyActivityPoint[];
  attendance30: readonly AttendanceDay[];
  linkedGym: LinkedGym;
  loading: boolean;
  error: string;
  hydrateStats: (gyms: readonly Gym[]) => Promise<void>;
}

export const useStats = create<StatsStore>((set) => ({
  weeklyActivity: [],
  attendance30: [],
  linkedGym: { id: '', name: 'No linked gym' },
  loading: false,
  error: '',

  hydrateStats: async (gyms) => {
    set({ loading: true, error: '' });
    try {
      const [history, memberships] = await Promise.all([getMyHistoryApi(), getMyMembershipsApi()]);
      const computed = buildComputedStats(history);
      const mappedLinkedGym = mapLinkedGymFromMembership(memberships, gyms as Gym[]);

      set({
        weeklyActivity: computed.weeklyMinutes as readonly WeeklyActivityPoint[],
        attendance30: computed.attendanceLast30 as readonly AttendanceDay[],
        linkedGym: mappedLinkedGym ?? { id: '', name: 'No linked gym' },
        loading: false,
      });
    } catch {
      set({ loading: false, error: 'Unable to refresh stats right now.' });
    }
  },
}));
