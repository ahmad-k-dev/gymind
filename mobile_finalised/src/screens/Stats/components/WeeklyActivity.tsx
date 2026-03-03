import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { F, R, S, useThemeColors } from '../../../theme';
import type { WeeklyActivityPoint } from '../../../types/stats';

interface WeeklyActivityProps {
  points: readonly WeeklyActivityPoint[];
}

export const WeeklyActivity = React.memo(function WeeklyActivity({ points }: WeeklyActivityProps) {
  const TC = useThemeColors();
  const defaultDayIndex = React.useMemo(() => {
    const jsDay = new Date().getDay();
    return (jsDay + 6) % 7;
  }, []);
  const [selectedDayIndex, setSelectedDayIndex] = React.useState(defaultDayIndex);
  const maxValue = React.useMemo(() => Math.max(...points.map((p) => p.value), 1), [points]);
  const avgHours = React.useMemo(() => points.reduce((acc, p) => acc + p.value, 0) / 60 / points.length, [points]);

  return (
    <View style={[s.card, { borderColor: TC.primary + '29', backgroundColor: TC.surface }]}>
      <View style={s.head}>
        <Text style={[s.title, { color: TC.muted }]}>Weekly Activity</Text>
        <View style={s.legendRow}>
          <View style={[s.dot, { backgroundColor: TC.primary }]} />
          <Text style={[s.legendText, { color: TC.muted }]}>Avg {avgHours.toFixed(1)}h / Day</Text>
        </View>
      </View>
      <View style={s.chart}>
        {points.map((point, idx) => {
          const heightPct = Math.max(8, (point.value / maxValue) * 100);
          const isSelected = idx === selectedDayIndex;
          return (
            <TouchableOpacity
              key={`${point.day}-${idx}`}
              style={s.col}
              activeOpacity={0.85}
              onPress={() => setSelectedDayIndex(idx)}
            >
              <Text style={[s.timeLabel, { color: TC.muted }]}>{`${point.value}m`}</Text>
              <View style={[s.track, { backgroundColor: TC.surface2 }]}>
                <View
                  style={[
                    s.bar,
                    {
                      height: `${heightPct}%`,
                      backgroundColor: isSelected ? TC.primary : TC.primary + '33',
                    },
                  ]}
                />
              </View>
              <Text style={[s.day, { color: TC.muted }, isSelected && { color: TC.primary }]}>{point.day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: R.lg,
    padding: S.md,
    gap: S.md,
  },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: F.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 142 },
  col: { flex: 1, alignItems: 'center', gap: 8 },
  timeLabel: { fontSize: 9, fontWeight: '700' },
  track: {
    width: '90%',
    flex: 1,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  day: { fontSize: 10, fontWeight: '800' },
});
