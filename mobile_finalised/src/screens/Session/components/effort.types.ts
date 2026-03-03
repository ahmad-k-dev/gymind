export type EffortLevel = 'normal' | 'focus' | 'hard' | 'overdrive' | 'extreme';

export interface EffortThreshold {
  level: EffortLevel;
  minSeconds: number;
}
