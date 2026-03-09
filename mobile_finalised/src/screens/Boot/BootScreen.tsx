import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { AppLogo } from '../../components/ui/AppLogo';
import { C, F, useThemeColors } from '../../theme';

export function BootScreen() {
  const TC = useThemeColors();
  const scale = useSharedValue(0.4);
  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
  }, [scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <View style={[s.c, { backgroundColor: TC.bg }]}>
      <Animated.View style={[s.box, anim]}>
        <MaterialCommunityIcons name="dumbbell" size={44} color="#fff" />
      </Animated.View>
      <AppLogo containerStyle={s.logo} />
      <Text style={[s.tag, { color: TC.muted }]}>Find. Train. Conquer.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 14 },
  box: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: { width: '42%' },
  tag: { fontSize: F.sm, fontWeight: '600', color: C.muted, letterSpacing: 2, textTransform: 'uppercase' },
});

