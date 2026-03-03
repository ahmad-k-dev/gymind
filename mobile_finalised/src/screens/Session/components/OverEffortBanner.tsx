import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { F, R, S, useThemeColors } from '../../../theme';

export type EffortLevel = 'normal' | 'focus' | 'hard' | 'overdrive' | 'extreme';

interface OverEffortBannerProps {
  level: EffortLevel;
  accentColor?: string;
}

const LEVEL_TEXT: Record<EffortLevel, string> = {
  normal: '',
  focus: '',
  hard: 'You have been training hard. Keep hydration up.',
  overdrive: 'You have been training hard today. Consider a short break.',
  extreme: 'Extreme duration detected. Wrap up soon and recover properly.',
};

export const OverEffortBanner = React.memo(function OverEffortBanner({ level, accentColor }: OverEffortBannerProps) {
  const TC = useThemeColors();
  const color = accentColor ?? TC.primary;
  const pulse = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  React.useEffect(() => {
    if (level === 'normal' || level === 'focus') {
      pulse.value = withTiming(1, { duration: 120 });
      return;
    }
    pulse.value = withRepeat(withSequence(withTiming(1.03, { duration: 700 }), withTiming(1, { duration: 700 })), -1, false);
  }, [level, pulse]);

  if (level === 'normal' || level === 'focus') return null;

  return (
    <Animated.View style={[s.banner, { borderColor: color + '55', backgroundColor: color + '12' }, animated]}>
      <View style={s.head}>
        <Text style={[s.title, { color }]}>Over-effort Notice</Text>
      </View>
      <Text style={[s.msg, { color: TC.text }]}>{LEVEL_TEXT[level]}</Text>
    </Animated.View>
  );
});

const s = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: R.lg,
    paddingHorizontal: S.md,
    paddingVertical: 10,
    gap: 3,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: F.xs, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  msg: { fontSize: F.sm, fontWeight: '600' },
});
