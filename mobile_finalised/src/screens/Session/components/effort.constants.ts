import type { EffortLevel, EffortThreshold } from './effort.types';

// Development/testing thresholds in seconds.
// Swap these values to minute-based thresholds later without touching UI logic.
export const EFFORT_THRESHOLDS: readonly EffortThreshold[] = [
  { level: 'extreme', minSeconds: 60 },
  { level: 'overdrive', minSeconds: 45 },
  { level: 'hard', minSeconds: 30 },
  { level: 'focus', minSeconds: 15 },
  { level: 'normal', minSeconds: 0 },

  // { level: 'extreme', minSeconds: 3 * 60 * 60 },   // 3h
  // { level: 'overdrive', minSeconds: 2 * 60 * 60 }, // 2h
  // { level: 'hard', minSeconds: 60 * 60 },          // 1h 30m
  // { level: 'focus', minSeconds: 45 * 60 },         // 45m
  // { level: 'normal', minSeconds: 0 },
] as const;

export function getEffortLevel(sec: number): EffortLevel {
  const found = EFFORT_THRESHOLDS.find((item) => sec >= item.minSeconds);
  return found?.level ?? 'normal';
}
