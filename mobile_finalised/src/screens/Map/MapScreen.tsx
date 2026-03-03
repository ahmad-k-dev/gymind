import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import { C, F, R, S, useThemeColors } from '../../theme';

export function MapScreen() {
  const TC = useThemeColors();
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]} edges={['top']}>
      <View style={s.container}>
        <View style={s.iconWrap}>
          <MaterialCommunityIcons name="map-marker-radius-outline" size={40} color={TC.primary} />
        </View>
        <Text style={[s.title, { color: TC.text }]}>Map</Text>
        <Text style={[s.sub, { color: TC.muted }]}>Nearby gym map experience will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: S.lg, gap: S.md },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: R.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  title: { fontSize: F.x2, fontWeight: '900', color: '#fff' },
  sub: { fontSize: F.base, fontWeight: '500', color: C.muted, textAlign: 'center' },
});

