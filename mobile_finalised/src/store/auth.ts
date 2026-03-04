import { create } from 'zustand';
import type { User } from '../types';
import { loginApi, logoutApi, registerApi } from '../services/api/authApi';
import { clearStoredTokens, getStoredTokens, setStoredTokens } from '../services/api/api';
import { mapUserFromBackend, mapUserPatchToBackendPayload } from '../services/api/mappers';
import { getUserApi, editProfileApi, uploadAvatarApi } from '../services/api/usersApi';
import { extractApiErrorMessage } from '../services/api/error';

interface UpdateProfilePayload {
  name: string;
  biography?: string;
  medicalConditions?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  authed: boolean;
  loading: boolean;
  error: string;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    gender: string;
    location?: string;
    dateOfBirth?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  updateAvatar: (uri: string) => Promise<void>;
  setTokens: (token: string, refreshToken: string) => Promise<void>;
  clearErr: () => void;
}

export const useAuth = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  authed: false,
  loading: false,
  error: '',

  init: async () => {
    const { token, refreshToken } = await getStoredTokens();

    if (!token || !refreshToken) {
      set({ loading: false, authed: false });
      return;
    }

    set({ token, refreshToken, authed: true, loading: false });
  },

  setTokens: async (token, refreshToken) => {
    await setStoredTokens(token, refreshToken);
    set({ token, refreshToken, authed: true });
  },

  login: async (email, password) => {
    set({ loading: true, error: '' });

    try {
      const tokenResponse = await loginApi({ Email: email, Password: password });
      await get().setTokens(tokenResponse.Token, tokenResponse.RefreshToken);
      const backendUser = await getUserApi(tokenResponse.UserID);

      set({ user: mapUserFromBackend(backendUser), loading: false, authed: true });
    } catch (error: unknown) {
      set({ loading: false, error: extractApiErrorMessage(error, 'Invalid credentials') });
      throw error;
    }
  },

  register: async (payload) => {
    set({ loading: true, error: '' });

    try {
      await registerApi({
        FullName: payload.fullName,
        Email: payload.email,
        Phone: payload.phone,
        Password: payload.password,
        Gender: payload.gender,
        Location: payload.location,
        DateOfBirth: payload.dateOfBirth,
      });
      set({ loading: false });
    } catch (error: unknown) {
      set({ loading: false, error: extractApiErrorMessage(error, 'Registration failed') });
      throw error;
    }
  },

  logout: async () => {
    await logoutApi();
    await clearStoredTokens();
    set({ token: null, refreshToken: null, authed: false, user: null, error: '' });
  },

  updateProfile: async (payload) => {
    const backendPayload = mapUserPatchToBackendPayload(payload);
    await editProfileApi(backendPayload);
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            name: payload.name,
            biography: payload.biography ?? state.user.biography,
            medicalConditions: payload.medicalConditions ?? state.user.medicalConditions,
          }
        : state.user,
    }));
  },

  updateAvatar: async (uri) => {
    if (!uri) {
      set((state) => ({ user: state.user ? { ...state.user, avatarUrl: '' } : state.user }));
      return;
    }

    await uploadAvatarApi({ uri, name: 'avatar.jpg', type: 'image/jpeg' });
    set((state) => ({ user: state.user ? { ...state.user, avatarUrl: uri } : state.user }));
  },

  clearErr: () => set({ error: '' }),
}));
