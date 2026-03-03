import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, F, S } from '../../../theme';

interface AboutSectionProps {
  about: string;
}

export const AboutSection = React.memo(function AboutSection({ about }: AboutSectionProps) {
  return (
    <View style={s.wrap}>
      <Text style={s.title}>About</Text>
      <Text style={s.body}>{about}</Text>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { gap: S.sm },
  title: {
    fontSize: F.xl,
    fontWeight: '800',
    color: '#fff',
  },
  body: {
    fontSize: F.base,
    color: C.muted,
    lineHeight: 22,
  },
});
