import { create } from 'zustand';
import { authApi } from '../screens/API/api'; 

interface AuthStore {
  user: any | null;
  token: string | null;
  refreshToken: string | null;
  authed: boolean;
  loading: boolean;
  error: string;
  init: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
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
    // This allows RootNavigator to finish booting
    set({ loading: false });
  },

register: async (payload) => {
  set({ loading: true, error: '' });
  try {
    // This is the standalone register call you requested
    await authApi.register(payload); 
    
    // If you want it to behave like Postman (just register), stop here:
    set({ loading: false });
    
    // Note: If you don't call login() here, the user stays on the register screen
    // but the loading spinner will finally stop.
  } catch (err: any) {
    const msg = err.response?.data || 'Registration failed';
    set({ 
        loading: false, // This stops the "indefinite loading"
        error: typeof msg === 'string' ? msg : 'Server Error' 
    });
  }
},

  login: async (email, pass) => {
    set({ loading: true, error: '' });
    try {
      const data = await authApi.login({ email, password: pass });
      set({ 
        token: data.token, 
        refreshToken: data.refreshToken,
        authed: true, // This triggers the UI change in RootNavigator
        loading: false 
      });
    } catch (err: any) {
      set({ loading: false, error: 'Invalid credentials' });
      throw err;
    }
  },

  logout: () => set({ token: null, authed: false, user: null }),
  clearErr: () => set({ error: '' })
}));