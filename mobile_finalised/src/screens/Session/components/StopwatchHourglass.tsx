import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
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

interface StopwatchHourglassProps {
  elapsedSec: number;
  accentColor?: string;
}

export const StopwatchHourglass = React.memo(function StopwatchHourglass({ elapsedSec, accentColor }: StopwatchHourglassProps) {
  const TC = useThemeColors();
  const color = accentColor ?? TC.primary;
  const progress = useSharedValue(0);

  React.useEffect(() => {
    const next = (elapsedSec % 3600) / 3600;
    progress.value = withTiming(next, { duration: 260 });
  }, [elapsedSec, progress]);

  const topSandStyle = useAnimatedStyle(() => ({ height: `${Math.max(0, 100 - progress.value * 100)}%` }));
  const bottomSandStyle = useAnimatedStyle(() => ({ height: `${Math.min(100, progress.value * 100)}%` }));
  const streamStyle = useAnimatedStyle(() => ({
    opacity: progress.value < 0.98 ? 0.9 : 0.35,
    height: `${Math.max(22, 54 - progress.value * 16)}%`,
  }));

  return (
    <View style={s.wrap}>
      <Text style={[s.label, { color: TC.muted }]}>Elapsed Time</Text>
      <View style={s.hourglass}>
        <View style={[s.rail, s.railLeft, { backgroundColor: TC.border }]} />
        <View style={[s.rail, s.railRight, { backgroundColor: TC.border }]} />
        <View style={[s.cap, s.capTop, { backgroundColor: TC.border }]} />
        <View style={[s.cap, s.capBottom, { backgroundColor: TC.border }]} />

        <View style={[s.chamber, s.top, { borderColor: TC.border, backgroundColor: TC.surface }]}>
          <Animated.View style={[s.sand, s.topSand, { backgroundColor: color }, topSandStyle]} />
        </View>

        <View style={[s.neck, { backgroundColor: TC.border }]}>
          <Animated.View style={[s.stream, { backgroundColor: color }, streamStyle]} />
        </View>

        <View style={[s.chamber, s.bottom, { borderColor: TC.border, backgroundColor: TC.surface }]}>
          <Animated.View style={[s.sand, s.bottomSand, { backgroundColor: color }, bottomSandStyle]} />
        </View>
      </View>
      <Text style={[s.time, { color }]}>{formatMainStopwatch(elapsedSec)}</Text>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10 },
  label: { fontSize: F.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2 },
  hourglass: {
    width: 92,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rail: {
    position: 'absolute',
    width: 3,
    height: 116,
    top: 12,
    borderRadius: R.full,
    opacity: 0.8,
  },
  railLeft: { left: 16 },
  railRight: { right: 16 },
  cap: {
    position: 'absolute',
    width: 58,
    height: 6,
    borderRadius: R.full,
    opacity: 0.9,
  },
  capTop: { top: 10 },
  capBottom: { bottom: 10 },
  chamber: {
    width: 58,
    overflow: 'hidden',
    borderWidth: 2,
    opacity: 0.95,
  },
  top: {
    height: 50,
    borderTopLeftRadius: R.lg,
    borderTopRightRadius: R.lg,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  bottom: {
    height: 50,
    borderBottomLeftRadius: R.lg,
    borderBottomRightRadius: R.lg,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  neck: {
    width: 14,
    height: 10,
    borderRadius: R.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stream: {
    width: 2,
    borderRadius: R.full,
  },
  sand: { width: '100%' },
  topSand: { borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  bottomSand: { borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  time: { marginTop: S.sm, fontSize: 42, fontWeight: '900', fontVariant: ['tabular-nums'] },
});
