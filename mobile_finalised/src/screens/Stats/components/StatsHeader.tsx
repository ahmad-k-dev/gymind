import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { F, R, S, useThemeColors } from '../../../theme';
import type { User } from '../../../types';

interface StatsHeaderProps {
  user: User | null;
  isFocused: boolean;
  onOpenSettings: () => void;
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=400&q=80';

export const StatsHeader = React.memo(function StatsHeader({ user, isFocused, onOpenSettings }: StatsHeaderProps) {
  const TC = useThemeColors();
  const lift = useSharedValue(14);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (!isFocused) return;
    lift.value = withTiming(0, { duration: 360 });
    opacity.value = withTiming(1, { duration: 360 });
  }, [isFocused, lift, opacity]);

  const avatarAnim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    marginTop: lift.value,
  }));

  return (
    <View style={s.wrap}>
      <View style={s.topBar}>
        <View style={s.leftSlot} />
        <Text style={[s.title, { color: TC.text }]}>Profile</Text>
        <TouchableOpacity style={[s.iconBtn, { borderColor: TC.border, backgroundColor: TC.surface }]} onPress={onOpenSettings} activeOpacity={0.85}>
          <MaterialCommunityIcons name="cog-outline" size={21} color={TC.text} />
        </TouchableOpacity>
      </View>

      <Animated.View style={[s.avatarWrap, avatarAnim]}>
        <View style={[s.avatarGlow, { backgroundColor: TC.primary }]} />
        <View style={[s.avatarRing, { borderColor: TC.primary, backgroundColor: TC.bg }]}>
          <Image source={{ uri: user?.avatarUrl || DEFAULT_AVATAR }} style={s.avatar} resizeMode="cover" />
        </View>
        <View style={[s.verifiedBadge, { backgroundColor: TC.primary, borderColor: TC.bg }]}>
          <MaterialCommunityIcons name="check-decagram" size={14} color="#fff" />
        </View>
      </Animated.View>

      <View style={s.meta}>
        <Text style={[s.name, { color: TC.text }]}>{user?.name ?? 'Athlete'}</Text>
        <View style={[s.tierChip, { borderColor: TC.primary + '44', backgroundColor: TC.primary + '1A' }]}>
          <MaterialCommunityIcons name="crown-outline" size={12} color={TC.primary} />
          <Text style={[s.tierText, { color: TC.primary }]}>{user?.tier ?? 'Basic'} Member</Text>
        </View>
        <Text style={[s.since, { color: TC.muted }]}>Member since {user?.memberSince ?? '-'}</Text>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { paddingHorizontal: S.lg, paddingTop: S.sm, alignItems: 'center', gap: S.sm },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSlot: { width: 38, height: 38 },
  title: { fontSize: F.md, fontWeight: '800' },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    marginTop: S.sm,
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 64,
    opacity: 0.15,
  },
  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    padding: 3,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 57 },
  verifiedBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { alignItems: 'center', gap: 6 },
  name: { fontSize: F.x2, fontWeight: '900' },
  tierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: R.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tierText: { fontSize: F.xs, fontWeight: '800', textTransform: 'uppercase' },
  since: { fontSize: F.sm, fontWeight: '500' },
});
