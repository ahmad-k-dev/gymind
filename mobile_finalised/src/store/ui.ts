import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MapPreference, ThemeMode, TimerStyle } from '../features/ui/ui.types';

interface UIStore {
  onboarded: boolean;
  notifications: number;
  location: string;
  themeMode: ThemeMode;
  timerStyle: TimerStyle;
  mapPreference: MapPreference;
  loadOnboarded: () => Promise<void>;
  loadPreferences: () => Promise<void>;
  completeOnboarding: () => void;
  setLocation: (l: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setTimerStyle: (style: TimerStyle) => void;
  setMapPreference: (preference: MapPreference) => void;
}

export const useUI = create<UIStore>((set) => ({
  onboarded: false,
  notifications: 2,
  location: 'Downtown Manhattan, NY',
  themeMode: 'dark',
  timerStyle: 'digital',
  mapPreference: 'default',

  loadOnboarded: async () => {
    try {
      const v = await AsyncStorage.getItem('onboarded');
      set({ onboarded: v === '1' });
    } catch {}
  },

  loadPreferences: async () => {
    try {
      const [theme, timerStyle, mapPreference] = await Promise.all([
        AsyncStorage.getItem('ui_theme_mode'),
        AsyncStorage.getItem('ui_timer_style'),
        AsyncStorage.getItem('ui_map_preference'),
      ]);

      set({
        themeMode: theme === 'light' ? 'light' : 'dark',
        timerStyle: timerStyle === 'hourglass' ? 'hourglass' : 'digital',
        mapPreference:
          mapPreference === 'apple' || mapPreference === 'google' || mapPreference === 'default'
            ? mapPreference
            : 'default',
      });
    } catch {}
  },

  completeOnboarding: () => {
    set({ onboarded: true });
    AsyncStorage.setItem('onboarded', '1').catch(() => {});
  },

  setLocation: (l) => set({ location: l }),

  setThemeMode: (mode) => {
    set({ themeMode: mode });
    AsyncStorage.setItem('ui_theme_mode', mode).catch(() => {});
  },

  setTimerStyle: (style) => {
    set({ timerStyle: style });
    AsyncStorage.setItem('ui_timer_style', style).catch(() => {});
  },

  setMapPreference: (preference) => {
    set({ mapPreference: preference });
    AsyncStorage.setItem('ui_map_preference', preference).catch(() => {});
  },
}));
