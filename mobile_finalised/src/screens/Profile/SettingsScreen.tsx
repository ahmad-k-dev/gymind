import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useUI } from '../../store/ui';
import { F, R, S, useThemeColors } from '../../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStack } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStack, 'Settings'>;

export function SettingsScreen({ navigation }: { navigation: Nav }) {
  const TC = useThemeColors();
  const themeMode = useUI((s) => s.themeMode);
  const timerStyle = useUI((s) => s.timerStyle);
  const setThemeMode = useUI((s) => s.setThemeMode);
  const setTimerStyle = useUI((s) => s.setTimerStyle);
  const [notifs, setNotifs] = React.useState(true);
  const [location, setLocation] = React.useState(true);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]}>
      <View style={s.nav}>
        <TouchableOpacity style={s.navBack} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={TC.muted} />
          <Text style={[s.back, { color: TC.muted }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: TC.text }]}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={[s.sectionTitle, { color: TC.muted }]}>Preferences</Text>
        <View style={[s.card, { backgroundColor: TC.surface, borderColor: TC.border }]}>
          <View style={s.row}>
            <View style={s.rowMain}>
              <MaterialCommunityIcons name="theme-light-dark" size={20} color={TC.text} />
              <Text style={[s.rowText, { color: TC.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={(v) => setThemeMode(v ? 'dark' : 'light')}
              thumbColor="#fff"
              trackColor={{ false: TC.surface2, true: TC.primary }}
            />
          </View>

          <View style={[s.row, s.borderRow, { borderTopColor: TC.border }]}>
            <View style={s.rowMain}>
              <MaterialCommunityIcons name="bell-outline" size={20} color={TC.text} />
              <Text style={[s.rowText, { color: TC.text }]}>Push Notifications</Text>
            </View>
            <Switch
              value={notifs}
              onValueChange={setNotifs}
              thumbColor="#fff"
              trackColor={{ false: TC.surface2, true: TC.primary }}
            />
          </View>

          <View style={[s.row, s.borderRow, { borderTopColor: TC.border }]}>
            <View style={s.rowMain}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color={TC.text} />
              <Text style={[s.rowText, { color: TC.text }]}>Location Services</Text>
            </View>
            <Switch
              value={location}
              onValueChange={setLocation}
              thumbColor="#fff"
              trackColor={{ false: TC.surface2, true: TC.primary }}
            />
          </View>
        </View>

        <Text style={[s.sectionTitle, { color: TC.muted }]}>Session</Text>
        <View style={[s.card, { backgroundColor: TC.surface, borderColor: TC.border }]}>
          <Text style={[s.subTitle, { color: TC.text }]}>Timer Style</Text>
          <View style={s.timerOptions}>
            <TouchableOpacity
              style={[
                s.timerPill,
                {
                  borderColor: timerStyle === 'digital' ? TC.primary : TC.border,
                  backgroundColor: timerStyle === 'digital' ? TC.primary + '22' : TC.surface2,
                },
              ]}
              onPress={() => setTimerStyle('digital')}
            >
              <Text style={[s.timerPillText, { color: timerStyle === 'digital' ? TC.primary : TC.muted }]}>Digital</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                s.timerPill,
                {
                  borderColor: timerStyle === 'hourglass' ? TC.primary : TC.border,
                  backgroundColor: timerStyle === 'hourglass' ? TC.primary + '22' : TC.surface2,
                },
              ]}
              onPress={() => setTimerStyle('hourglass')}
            >
              <Text style={[s.timerPillText, { color: timerStyle === 'hourglass' ? TC.primary : TC.muted }]}>Hourglass</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
  },
  navBack: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  back: { fontSize: F.base, fontWeight: '600' },
  title: { fontSize: F.lg, fontWeight: '800' },
  scroll: { padding: S.lg, gap: S.lg, paddingBottom: 70 },
  sectionTitle: {
    fontSize: F.xs,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: S.sm,
    marginLeft: S.sm,
  },
  card: {
    borderRadius: R.xl,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    gap: S.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: S.sm },
  borderRow: { borderTopWidth: StyleSheet.hairlineWidth },
  rowMain: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  rowText: { fontSize: F.base, fontWeight: '600' },
  subTitle: { fontSize: F.sm, fontWeight: '800', marginTop: 4 },
  timerOptions: { flexDirection: 'row', gap: S.sm, marginBottom: 6 },
  timerPill: {
    flex: 1,
    height: 44,
    borderRadius: R.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerPillText: { fontSize: F.base, fontWeight: '700' },
});
