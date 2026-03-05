import { create } from "zustand";
import type { User } from "../types";
import * as SecureStore from "expo-secure-store";

import { authApi, clearStoredTokens, getStoredTokens, setStoredTokens } from "../services/api/api";
import { getUserApi, editProfileApi, uploadAvatarApi } from "../services/api/usersApi";
import { mapUserFromBackend, mapUserPatchToBackendPayload } from "../services/api/mappers";
import { extractApiErrorMessage } from "../services/api/error";

const USER_ID_STORAGE_KEY = "UserID";

interface UpdateProfilePayload {
  name: string;
  biography?: string;
  medicalConditions?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  userId: string | null;

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

  setTokens: (token: string, refreshToken: string, userId?: string | null) => Promise<void>;
  clearErr: () => void;
}

type TokenExchangeResponse = {
  Token: string;
  RefreshToken: string;
  Roles: string[];
  UserID: string;
};

export const useAuth = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  userId: null,

  authed: false,
  loading: false,
  error: "",

  init: async () => {
    set({ loading: true, error: "" });

    try {
      const { token, refreshToken } = await getStoredTokens();
      const storedUserId = await SecureStore.getItemAsync(USER_ID_STORAGE_KEY);

      if (!token || !refreshToken) {
        set({ token: null, refreshToken: null, userId: null, authed: false, loading: false });
        return;
      }

      set({
        token,
        refreshToken,
        userId: storedUserId ?? null,
        authed: true,
      });

      if (storedUserId) {
        try {
          const backendUser = await getUserApi(storedUserId);
          set({ user: mapUserFromBackend(backendUser) });
        } catch {
          // keep authed; user fetch can fail if endpoint is restricted, etc.
        }
      }

      set({ loading: false });
    } catch {
      set({ loading: false, authed: false, token: null, refreshToken: null, userId: null, user: null });
    }
  },

  setTokens: async (token, refreshToken, userId) => {
    await setStoredTokens(token, refreshToken);

    if (userId) {
      await SecureStore.setItemAsync(USER_ID_STORAGE_KEY, userId);
    }

    set({
      token,
      refreshToken,
      userId: userId ?? get().userId,
      authed: true,
    });
  },

  login: async (email, password) => {
    set({ loading: true, error: "" });

    try {
      // ✅ resolves to POST /api/auth/login because baseURL ends with /api
      const data = await authApi.login({ Email: email, Password: password }) as TokenExchangeResponse;

      if (!data?.Token || !data?.RefreshToken || !data?.UserID) {
        throw new Error("Login response missing Token/RefreshToken/UserID.");
      }

      await get().setTokens(data.Token, data.RefreshToken, data.UserID);

      try {
        const backendUser = await getUserApi(data.UserID);
        set({ user: mapUserFromBackend(backendUser) });
      } catch {
        set({ user: ({ email } as any) });
      }

      set({ loading: false });
    } catch (error: unknown) {
      const msg = extractApiErrorMessage(error, "Login failed");
      set({ loading: false, error: msg, authed: false });
      throw new Error(msg);
    }
  },

  register: async (payload) => {
    set({ loading: true, error: "" });

    try {
      // ✅ resolves to POST /api/auth/register
      await authApi.register({
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
      const msg = extractApiErrorMessage(error, "Registration failed");
      set({ loading: false, error: msg });
      throw error;
    }
  },

  logout: async () => {
    await clearStoredTokens();
    await SecureStore.deleteItemAsync(USER_ID_STORAGE_KEY);

    set({
      token: null,
      refreshToken: null,
      userId: null,
      authed: false,
      user: null,
      error: "",
      loading: false,
    });
  },

  updateProfile: async (payload) => {
    set({ loading: true, error: "" });

    try {
      const backendPayload = mapUserPatchToBackendPayload(payload);
      await editProfileApi(backendPayload);

      set((state) => ({
        loading: false,
        user: state.user
          ? {
              ...state.user,
              name: payload.name,
              biography: payload.biography ?? state.user.biography,
              medicalConditions: payload.medicalConditions ?? state.user.medicalConditions,
            }
          : state.user,
      }));
    } catch (error: unknown) {
      const msg = extractApiErrorMessage(error, "Update profile failed");
      set({ loading: false, error: msg });
      throw error;
    }
  },

  updateAvatar: async (uri) => {
    set({ loading: true, error: "" });

    try {
      if (!uri) {
        set((state) => ({
          loading: false,
          user: state.user ? { ...state.user, avatarUrl: "" } : state.user,
        }));
        return;
      }

      await uploadAvatarApi({ uri, name: "avatar.jpg", type: "image/jpeg" });

      set((state) => ({
        loading: false,
        user: state.user ? { ...state.user, avatarUrl: uri } : state.user,
      }));
    } catch (error: unknown) {
      const msg = extractApiErrorMessage(error, "Avatar upload failed");
      set({ loading: false, error: msg });
      throw error;
    }
  },

  clearErr: () => set({ error: "" }),
}));