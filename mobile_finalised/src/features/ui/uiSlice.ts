import { useUI } from '../../store/ui';
import type { MapPreference, ThemeMode, TimerStyle } from './ui.types';

export const uiSlice = {
  getState: () => useUI.getState(),
  setThemeMode: (mode: ThemeMode) => useUI.getState().setThemeMode(mode),
  setTimerStyle: (style: TimerStyle) => useUI.getState().setTimerStyle(style),
  setMapPreference: (preference: MapPreference) => useUI.getState().setMapPreference(preference),
  loadPreferences: () => useUI.getState().loadPreferences(),
};
