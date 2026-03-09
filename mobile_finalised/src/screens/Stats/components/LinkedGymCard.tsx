import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { F, R, S, useThemeColors } from '../../../theme';
import type { LinkedGym } from '../../../types/stats';

interface LinkedGymCardProps {
  gym: LinkedGym;
  onPress: () => void;
}

export const LinkedGymCard = React.memo(function LinkedGymCard({ gym, onPress }: LinkedGymCardProps) {
  const TC = useThemeColors();
  return (
    <View style={s.wrap}>
      <Text style={[s.sectionTitle, { color: TC.muted }]}>Linked Gym</Text>
      <TouchableOpacity style={[s.card, { borderColor: TC.primary + '29', backgroundColor: TC.surface }]} onPress={onPress} activeOpacity={0.9}>
        <Image source={{ uri: gym.image }} style={[s.img, { backgroundColor: TC.surface2 }]} resizeMode="cover" />
        <View style={s.info}>
          <Text style={[s.name, { color: TC.text }]} numberOfLines={1}>
            {gym.name}
          </Text>
          <View style={s.addrRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={12} color={TC.muted} />
            <Text style={[s.addr, { color: TC.muted }]} numberOfLines={1}>
              {gym.address ?? 'Address unavailable'}
            </Text>
          </View>
        </View>
        <View style={[s.cta, { backgroundColor: TC.primary }]}>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { gap: S.sm },
  sectionTitle: { fontSize: F.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  card: {
    borderWidth: 1,
    borderRadius: R.lg,
    padding: S.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
  },
  img: { width: 64, height: 64, borderRadius: R.md },
  info: { flex: 1, gap: 4 },
  name: { fontSize: F.base, fontWeight: '800' },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addr: { fontSize: F.xs, flex: 1 },
  cta: {
    width: 34,
    height: 34,
    borderRadius: R.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
