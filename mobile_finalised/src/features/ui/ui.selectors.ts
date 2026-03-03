import { useUI } from '../../store/ui';

export const selectThemeMode = (state: ReturnType<typeof useUI.getState>) => state.themeMode;
export const selectTimerStyle = (state: ReturnType<typeof useUI.getState>) => state.timerStyle;
export const selectMapPreference = (state: ReturnType<typeof useUI.getState>) => state.mapPreference;
