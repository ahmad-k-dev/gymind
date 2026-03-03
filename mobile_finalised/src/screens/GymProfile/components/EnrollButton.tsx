import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { C, F, R, S } from '../../../theme';

interface EnrollButtonProps {
  onPress: () => void;
}

export const EnrollButton = React.memo(function EnrollButton({ onPress }: EnrollButtonProps) {
  return (
    <TouchableOpacity style={s.button} onPress={onPress} activeOpacity={0.9}>
      <Text style={s.text}>Enroll Now</Text>
    </TouchableOpacity>
  );
});

const s = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: R.lg,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: S.md,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    color: '#fff',
    fontSize: F.lg,
    fontWeight: '900',
  },
});
