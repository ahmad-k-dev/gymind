import { create } from 'zustand';
import type { Gym } from '../types';
import { normalizeGymProfile } from '../data/mockGyms';
import { getAllGymsApi } from '../services/api/gymsApi';
import { mapGymFromBackend } from '../services/api/mappers';

interface GymsStore {
  gyms: Gym[];
  selected: Gym | null;
  query: string;
  loading: boolean;
  fetchGyms: () => Promise<void>;
  select: (id: string) => void;
  search: (q: string) => void;
  results: () => Gym[];
}

export const useGyms = create<GymsStore>((set, get) => ({
  gyms: [],
  selected: null,
  query: '',
  loading: false,

  fetchGyms: async () => {
    set({ loading: true });

    try {
      const gymsFromBackend = await getAllGymsApi();
      set({ gyms: gymsFromBackend.map(mapGymFromBackend).map(normalizeGymProfile), loading: false });
    } catch {
      set({ loading: false });
    }
  },

  select: (id) => set({ selected: get().gyms.find((g) => g.id === id) ?? null }),

  search: (q) => set({ query: q }),

  results: () => {
    const { gyms, query } = get();
    if (!query.trim()) return gyms;
    const lowerQuery = query.toLowerCase();

    return gyms.filter(
      (gym) => gym.name.toLowerCase().includes(lowerQuery) || gym.tags.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  },
}));
