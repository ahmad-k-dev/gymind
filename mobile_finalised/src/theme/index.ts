import { useUI } from '../store/ui';

export const C = {
  primary: '#FD6A08',
  bg: '#0A0A0A',
  surface: '#161616',
  surface2: '#222222',
  text: '#FFFFFF',
  muted: '#9CA3AF',
  border: 'rgba(255,255,255,0.09)',
  green: '#22C55E',
  yellow: '#EAB308',
  red: '#EF4444',
  blue: '#3B82F6',
} as const;

export const S = { xs:4, sm:8, md:16, lg:24, xl:32, xxl:48 } as const;
export const R = { sm:6, md:12, lg:16, xl:24, full:999 } as const;
export const F = { xs:10, sm:12, base:14, md:16, lg:18, xl:20, x2:24, x3:28, x4:36 } as const;

export const LIGHT_C = {
  primary: '#FD6A08',
  bg: '#F8F7F5',
  surface: '#FFFFFF',
  surface2: '#F1F2F4',
  text: '#0F172A',
  muted: '#64748B',
  border: 'rgba(15,23,42,0.10)',
  green: '#16A34A',
  yellow: '#CA8A04',
  red: '#DC2626',
  blue: '#2563EB',
} as const;

export function useThemeColors() {
  const mode = useUI((s) => s.themeMode);
  return mode === 'light' ? LIGHT_C : C;
}
