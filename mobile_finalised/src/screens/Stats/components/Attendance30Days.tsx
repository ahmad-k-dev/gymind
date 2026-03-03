import React from 'react';
import { FlatList, StyleSheet, Text, View, type ListRenderItem } from 'react-native';
import { F, R, S, useThemeColors } from '../../../theme';
import type { AttendanceDay } from '../../../types/stats';

interface Attendance30DaysProps {
  days: readonly AttendanceDay[];
}

const AttendanceCell = React.memo(function AttendanceCell({
  attended,
  onColor,
  offColor,
}: {
  attended: boolean;
  onColor: string;
  offColor: string;
}) {
  return <View style={[s.cell, { backgroundColor: attended ? onColor : offColor }]} />;
});

export const Attendance30Days = React.memo(function Attendance30Days({ days }: Attendance30DaysProps) {
  const TC = useThemeColors();
  const presentCount = React.useMemo(() => days.filter((d) => d.attended).length, [days]);

  const renderItem = React.useCallback<ListRenderItem<AttendanceDay>>(
    ({ item }) => <AttendanceCell attended={item.attended} onColor={TC.primary + 'CC'} offColor={TC.primary + '22'} />,
    [TC.primary]
  );

  const keyExtractor = React.useCallback((item: AttendanceDay) => item.date, []);

  return (
    <View style={[s.card, { borderColor: TC.primary + '29', backgroundColor: TC.surface }]}>
      <View style={s.head}>
        <Text style={[s.title, { color: TC.muted }]}>Attendance Diagram</Text>
        <Text style={[s.last30, { color: TC.primary }]}>Last 30 Days</Text>
      </View>

      <FlatList
        data={days}
        numColumns={10}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        scrollEnabled={false}
        columnWrapperStyle={s.row}
        contentContainerStyle={s.grid}
      />

      <View style={s.legend}>
        <View style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: TC.primary + 'CC' }]} />
          <Text style={[s.legendText, { color: TC.muted }]}>Present</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: TC.primary + '22' }]} />
          <Text style={[s.legendText, { color: TC.muted }]}>Absent</Text>
        </View>
      </View>

      <Text style={[s.note, { color: TC.muted }]}>"Consistency is key. {presentCount} visits this month."</Text>
    </View>
  );
});

const s = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: R.lg,
    padding: S.md,
    gap: S.sm,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: F.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  last30: { fontSize: F.xs, fontWeight: '800' },
  grid: { gap: 6 },
  row: { gap: 6 },
  cell: { width: 24, height: 24, borderRadius: 5 },
  legend: { flexDirection: 'row', gap: S.md, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 11, height: 11, borderRadius: 3 },
  legendText: { fontSize: F.xs, fontWeight: '700' },
  note: { marginTop: 6, textAlign: 'center', fontSize: F.xs, fontStyle: 'italic' },
});
