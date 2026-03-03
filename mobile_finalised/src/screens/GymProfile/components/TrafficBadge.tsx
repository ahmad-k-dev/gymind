import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, F, R } from '../../../theme';
import type { Traffic } from '../../../types';

const TRAFFIC_COLORS: Record<Traffic, string> = {
  Low: C.green,
  Medium: C.yellow,
  High: C.primary,
};

interface TrafficBadgeProps {
  trafficLevel: Traffic;
}

export const TrafficBadge = React.memo(function TrafficBadge({ trafficLevel }: TrafficBadgeProps) {
  const color = TRAFFIC_COLORS[trafficLevel];

  return (
    <View style={[s.container, { borderColor: color + '44', backgroundColor: color + '1A' }]}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={[s.label, { color }]}>{trafficLevel} Traffic</Text>
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: R.full,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: F.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
});
