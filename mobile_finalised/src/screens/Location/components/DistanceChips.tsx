import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { F, R, S, useThemeColors } from '../../../theme';

export type DistanceBucket = '0-3' | '3-6' | '6-10';

interface BucketOption {
  id: DistanceBucket;
  label: string;
}

const OPTIONS: readonly BucketOption[] = [
  { id: '0-3', label: '0-3km' },
  { id: '3-6', label: '3-6km' },
  { id: '6-10', label: '6-10km' },
];

interface DistanceChipsProps {
  selected: DistanceBucket;
  onSelect: (bucket: DistanceBucket) => void;
}

export const DistanceChips = React.memo(function DistanceChips({
  selected,
  onSelect,
}: DistanceChipsProps) {
  const TC = useThemeColors();

  return (
    <View style={s.wrap}>
      {OPTIONS.map((option) => {
        const active = option.id === selected;
        return (
          <TouchableOpacity
            key={option.id}
            style={[
              s.chip,
              {
                borderColor: active ? TC.primary : TC.border,
                backgroundColor: active ? `${TC.primary}22` : TC.surface,
              },
            ]}
            onPress={() => onSelect(option.id)}
            activeOpacity={0.85}
          >
            <Text style={[s.label, { color: active ? TC.primary : TC.text }]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: S.sm,
  },
  chip: {
    height: 36,
    borderRadius: R.full,
    borderWidth: 1,
    paddingHorizontal: S.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: F.xs,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});

