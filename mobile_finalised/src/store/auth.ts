import { create } from 'zustand';
import type { User } from '../types';
import * as SS from 'expo-secure-store';

const MOCK: User = {
  id:'u1', name:'Alex Rivera', email:'alex@gymind.com', role:'User',
  memberSince:'Jan 2023', tier:'Elite', workouts:248, hours:156,
  phone: '5551234567',
  membershipNumber: '100245',
  age: 28,
  heightCm: 178,
  weightKg: 76,
  avatarUrl: '',
  biography: 'Focused on strength and conditioning.',
  medicalConditions: '',
  fitnessGoal: 'Build muscle and improve endurance',
  trainingFrequencyPerWeek: 4,
  assessmentNotes: 'Good baseline mobility. Improve hamstring flexibility.',
};

type ProfileUpdate = Pick<
  User,
  | 'name'
  | 'heightCm'
  | 'weightKg'
  | 'biography'
  | 'medicalConditions'
  | 'fitnessGoal'
  | 'trainingFrequencyPerWeek'
  | 'assessmentNotes'
>;

interface AuthStore {
  user: User | null;
  authed: boolean;
  loading: boolean;
  error: string;
  init: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: ProfileUpdate) => void;
  updateAvatar: (avatarUrl: string) => void;
  clearErr: () => void;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null, authed: false, loading: false, error: '',

  init: async () => {
    try {
      const t = await SS.getItemAsync('token');
      if (t) set({ user: MOCK, authed: true });
    } catch {}
  },

  login: async (email, pass) => {
    set({ loading: true, error: '' });
    await new Promise(r => setTimeout(r, 1000));
    if (!email.includes('@') || pass.length < 6) {
      set({ loading: false, error: 'Invalid credentials' });
      throw new Error('Invalid credentials');
    }
    await SS.setItemAsync('token', 'tok_' + Date.now());
    set({ user: MOCK, authed: true, loading: false });
  },

  register: async (name, email) => {
    set({ loading: true, error: '' });
    await new Promise(r => setTimeout(r, 1200));
    await SS.setItemAsync('token', 'tok_' + Date.now());
    set({ user: { ...MOCK, name, email }, authed: true, loading: false });
  },

  logout: async () => {
    await SS.deleteItemAsync('token');
    set({ user: null, authed: false });
  },

  updateProfile: (payload) => set((state) => (
    state.user ? { user: { ...state.user, ...payload } } : state
  )),

  updateAvatar: (avatarUrl) => set((state) => (
    state.user ? { user: { ...state.user, avatarUrl } } : state
  )),

  clearErr: () => set({ error: '' }),
}));
