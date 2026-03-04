import { create } from 'zustand';
import type { User } from '../types';
import { clearAuthToken, getAuthToken, persistAuthToken } from '../services/api/client';
import { loginApi, registerApi } from '../services/api/authApi';
import { getUserByIdApi, editMyProfileApi } from '../services/api/usersApi';
import { getUserIdFromToken } from '../services/api/jwt';
import { mapUserFromBackend } from '../services/api/mappers';

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
  updateProfile: (payload: ProfileUpdate) => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  clearErr: () => void;
}

export const useAuth = create<AuthStore>((set, get) => ({
  user: null,
  authed: false,
  loading: false,
  error: '',

  init: async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const userId = getUserIdFromToken(token);
      if (!userId) {
        await clearAuthToken();
        return;
      }

      const backendUser = await getUserByIdApi(userId);
      set({ user: mapUserFromBackend(backendUser), authed: true });
    } catch {
      await clearAuthToken();
      set({ user: null, authed: false });
    }
  },

  login: async (email, pass) => {
    set({ loading: true, error: '' });

    try {
      const { token } = await loginApi({ email, password: pass });
      await persistAuthToken(token);

      const userId = getUserIdFromToken(token);
      if (!userId) {
        throw new Error('Could not resolve user ID from token');
      }

      const backendUser = await getUserByIdApi(userId);
      set({ user: mapUserFromBackend(backendUser), authed: true, loading: false });
    } catch {
      set({ loading: false, error: 'Invalid credentials' });
      throw new Error('Invalid credentials');
    }
  },

  register: async (name, email, pass) => {
    set({ loading: true, error: '' });

    try {
      await registerApi({
        fullName: name,
        email,
        password: pass,
        phone: '',
        gender: 'PreferNotToSay',
      });

      await get().login(email, pass);
      set({ loading: false });
    } catch {
      set({ loading: false, error: 'Unable to create account.' });
      throw new Error('Unable to create account.');
    }
  },

  logout: async () => {
    await clearAuthToken();
    set({ user: null, authed: false });
  },

  updateProfile: async (payload) => {
    const currentUser = get().user;
    if (!currentUser) return;

    await editMyProfileApi({
      fullName: payload.name,
      biography: payload.biography,
      medicalConditions: payload.medicalConditions,
    });

    set((state) => (state.user ? { user: { ...state.user, ...payload } } : state));
  },

  updateAvatar: async (avatarUrl) => {
    if (!avatarUrl) {
      set((state) => (state.user ? { user: { ...state.user, avatarUrl: '' } } : state));
      return;
    }

    await editMyProfileApi({
      imageFile: {
        uri: avatarUrl,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      },
    });

    set((state) => (state.user ? { user: { ...state.user, avatarUrl } } : state));
  },

  clearErr: () => set({ error: '' }),
}));
