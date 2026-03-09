import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { F, R, S, useThemeColors } from '../../../theme';

interface SessionStatsRowProps {
  startedAtLabel: string;
  activity: string;
  gymName: string;
}

const SessionStatCard = React.memo(function SessionStatCard({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
}) {
  const TC = useThemeColors();
  return (
    <View style={[s.card, { backgroundColor: TC.surface, borderColor: TC.border }]}>
      <View style={s.head}>
        <MaterialCommunityIcons name={icon} size={14} color={TC.primary} />
        <Text style={[s.label, { color: TC.muted }]}>{label}</Text>
      </View>
      <Text style={[s.value, { color: TC.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
});

export const SessionStatsRow = React.memo(function SessionStatsRow({
  startedAtLabel,
  activity,
  gymName,
}: SessionStatsRowProps) {
  return (
    <View style={s.wrap}>
      <View style={s.grid}>
        <SessionStatCard icon="clock-outline" label="Started at" value={startedAtLabel} />
        <SessionStatCard icon="dumbbell" label="Current Activity" value={activity} />
      </View>
      <Text style={s.gymName}>{gymName}</Text>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { gap: S.sm },
  grid: { flexDirection: 'row', gap: S.sm },
  card: {
    flex: 1,
    borderRadius: R.lg,
    borderWidth: 1,
    padding: S.md,
    gap: 6,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  label: { fontSize: F.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  value: { fontSize: F.md, fontWeight: '800' },
  gymName: { fontSize: F.sm, fontWeight: '700', color: '#FD6A08', opacity: 0.9, paddingHorizontal: 4 },
});
