import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { F, R, S } from '../../../theme';
import type { TimerStyle } from '../../../features/ui/ui.types';
import type { EffortLevel } from './effort.types';
import { getEffortLevel } from './effort.constants';
import { StopwatchDigital } from './StopwatchDigital';
import { StopwatchHourglass } from './StopwatchHourglass';

interface EffortPalette {
  normal: string;
  focus: string;
  hard: string;
  overdrive: string;
  extreme: string;
}

interface EffortTimerProps {
  elapsedSec: number;
  running: boolean;
  timerStyle: TimerStyle;
  palette: EffortPalette;
  mutedColor: string;
  borderColor: string;
}

const LEVEL_INDEX: Record<EffortLevel, number> = {
  normal: 0,
  focus: 1,
  hard: 2,
  overdrive: 3,
  extreme: 4,
};

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

export const EffortTimer = React.memo(function EffortTimer({
  elapsedSec,
  running,
  timerStyle,
  palette,
  mutedColor,
  borderColor,
}: EffortTimerProps) {
  const [level, setLevel] = React.useState<EffortLevel>('normal');
  const levelProgress = useSharedValue(0);
  const popScale = useSharedValue(1);
  const glowStrength = useSharedValue(0);

  React.useEffect(() => {
    const nextLevel = getEffortLevel(elapsedSec);
    setLevel((prevLevel) => {
      if (running && LEVEL_INDEX[nextLevel] > LEVEL_INDEX[prevLevel]) {
        popScale.value = withSequence(withTiming(1.08, { duration: 90 }), withTiming(1, { duration: 90 }));
      }
      return nextLevel;
    });
  }, [elapsedSec, popScale, running]);

  React.useEffect(() => {
    const nextIndex = LEVEL_INDEX[level];
    levelProgress.value = withTiming(nextIndex, { duration: 260 });
    const targetGlow = level === 'focus' ? 0.18 : level === 'hard' ? 0.3 : level === 'overdrive' ? 0.46 : level === 'extreme' ? 0.65 : 0;
    glowStrength.value = withTiming(targetGlow, { duration: 260 });
  }, [glowStrength, level, levelProgress]);

  const animatedColor = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      levelProgress.value,
      [0, 1, 2, 3, 4],
      [palette.normal, palette.focus, palette.hard, palette.overdrive, palette.extreme]
    ),
    shadowColor: interpolateColor(
      levelProgress.value,
      [0, 1, 2, 3, 4],
      [palette.normal, palette.focus, palette.hard, palette.overdrive, palette.extreme]
    ),
    shadowOpacity: glowStrength.value,
    shadowRadius: 18,
  }));

  const popAnimated = useAnimatedStyle(() => ({
    transform: [{ scale: popScale.value }],
  }));

  const fireWrap = useAnimatedStyle(() => ({
    opacity: level === 'normal' ? 0 : level === 'focus' ? 0.35 : level === 'hard' ? 0.72 : 1,
    transform: [{ scale: level === 'focus' ? 0.8 : level === 'hard' ? 1 : level === 'overdrive' ? 1.08 : 1.14 }],
  }));

  const accentColor =
    level === 'focus'
      ? palette.focus
      : level === 'hard'
      ? palette.hard
      : level === 'overdrive'
      ? palette.overdrive
      : level === 'extreme'
      ? palette.extreme
      : palette.normal;

  const TimerComponent = timerStyle === 'hourglass' ? StopwatchHourglass : StopwatchDigital;

  return (
    <Animated.View style={[s.shell, { borderColor }, animatedColor, popAnimated]}>
      <Animated.View style={[s.ring, { borderTopColor: 'transparent', borderLeftColor: 'transparent' }, animatedColor]} />
      <TimerComponent elapsedSec={elapsedSec} accentColor={accentColor} />

      <Animated.View style={[s.fireRow, fireWrap]}>
        {(level === 'hard' || level === 'overdrive' || level === 'extreme') && (
          <>
            <MaterialCommunityIcons name="fire" size={16} color={accentColor} />
            <MaterialCommunityIcons name={level === 'extreme' ? 'fire-circle' : 'fire'} size={22} color={accentColor} />
            <MaterialCommunityIcons name="fire" size={16} color={accentColor} />
          </>
        )}
      </Animated.View>

      <View style={s.metaChip}>
        <Text style={[s.metaTxt, { color: mutedColor }]}>{formatMainStopwatch(elapsedSec)}</Text>
      </View>
    </Animated.View>
  );
});

const s = StyleSheet.create({
  shell: {
    marginTop: S.md,
    borderRadius: R.full,
    borderWidth: 4,
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: R.full,
    borderWidth: 4,
    transform: [{ rotate: '45deg' }],
  },
  fireRow: {
    position: 'absolute',
    bottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  metaChip: {
    position: 'absolute',
    top: 20,
    borderRadius: R.full,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaTxt: {
    fontSize: F.xs,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
