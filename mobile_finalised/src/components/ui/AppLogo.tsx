import React from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { C, F } from '../../theme';

interface AppLogoProps {
  containerStyle?: StyleProp<ViewStyle>;
}

// Replace the placeholder file with your final brand asset at src/assets/images/logo.png.
const LOGO_SOURCE = require('../../assets/images/logo.png');

export function AppLogo({ containerStyle }: AppLogoProps) {
  return (
    <View style={[s.wrap, containerStyle]}>
      <Image source={LOGO_SOURCE} style={s.logo} resizeMode="contain" />
      <Text style={s.fallback}>GYMIND</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: '34%', aspectRatio: 3.4, justifyContent: 'center' },
  logo: { width: '100%', height: '100%' },
  fallback: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: F.base,
    color: C.primary,
    fontWeight: '900',
    letterSpacing: 1,
    opacity: 0,
  },
});
