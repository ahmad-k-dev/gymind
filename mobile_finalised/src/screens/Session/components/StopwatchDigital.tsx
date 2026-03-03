import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { F, R, S, useThemeColors } from '../../../theme';

function formatMainStopwatch(elapsedSec: number): string {
  if (elapsedSec >= 3600) {
    const h = Math.floor(elapsedSec / 3600);
    const m = Math.floor((elapsedSec % 3600) / 60);
    const s = elapsedSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  const m = Math.floor(elapsedSec / 60);
  const s = elapsedSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface StopwatchDigitalProps {
  elapsedSec: number;
  accentColor?: string;
}

export const StopwatchDigital = React.memo(function StopwatchDigital({ elapsedSec, accentColor }: StopwatchDigitalProps) {
  const TC = useThemeColors();
  const color = accentColor ?? TC.primary;

  return (
    <View style={s.wrap}>
      <Text style={[s.label, { color: TC.muted }]}>Elapsed Time</Text>
      <Text style={[s.time, { color }]}>{formatMainStopwatch(elapsedSec)}</Text>
      <Text style={[s.intensity, { color: TC.muted }]}>High Intensity</Text>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  label: { fontSize: F.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },
  time: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(253,106,8,0.35)',
    textShadowRadius: 18,
  },
  intensity: {
    marginTop: S.sm,
    fontSize: F.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    paddingHorizontal: S.md,
    paddingVertical: 6,
    borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
