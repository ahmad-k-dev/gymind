import { create } from 'zustand';
import type { User } from '../types';
import * as SS from 'expo-secure-store';
import { authApi } from '../screens/API/api'; // Import the authApi from your API module

interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  authed: boolean;
  loading: boolean;
  error: string;
  init: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  setTokens: (token: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
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
    try {
      const t = await SS.getItemAsync('token');
      const rt = await SS.getItemAsync('refreshToken');
      // In a real app, you might call a /me endpoint here to get user details
      if (t) set({ token: t, refreshToken: rt, authed: true });
    } catch (err) {
      console.error("Failed to initialize auth", err);
    }
  },

  login: async (email, pass) => {
    set({ loading: true, error: '' });
    try {
      // Calls the LoginAsync method in your UserService
      const response = await authApi.login({ Email: email, Password: pass });
      
      // The backend returns a TokenExchangeRequestDto containing Token and RefreshToken
      const { token: accessToken, refreshToken, roles } = response.token;

      await SS.setItemAsync('token', accessToken);
      await SS.setItemAsync('refreshToken', refreshToken);

      set({ 
        token: accessToken, 
        refreshToken, 
        authed: true, 
        loading: false,
        // Map the backend roles to your user object
        user: { email, roles } as any 
      });
    } catch (err: any) {
      // Captures the "Invalid credentials" or "Inactive" messages from AuthController
      const errMsg = err.response?.data || 'Login failed';
      set({ loading: false, error: errMsg });
      throw new Error(errMsg);
    }
  },

  setTokens: async (token, refreshToken) => {
    await SS.setItemAsync('token', token);
    await SS.setItemAsync('refreshToken', refreshToken);
    set({ token, refreshToken });
  },

  logout: async () => {
    await SS.deleteItemAsync('token');
    await SS.deleteItemAsync('refreshToken');
    set({ user: null, token: null, refreshToken: null, authed: false });
  },

  clearErr: () => set({ error: '' }),
}));