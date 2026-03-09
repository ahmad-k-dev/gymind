import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAuth } from '../../store/auth';
import { C, S, R, F, useThemeColors } from '../../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStack } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStack, 'Profile'>;
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface MenuItem {
  label: string;
  icon: IconName;
  action: () => void;
}

export function ProfileScreen({ navigation }: { navigation: Nav }) {
  const TC = useThemeColors();
  const { user, logout } = useAuth();
  const avatarAnim = useSharedValue(0);
  const [showPersonalInfo, setShowPersonalInfo] = React.useState(false);
  const bmi =
    user?.heightCm && user?.weightKg
      ? user.weightKg / ((user.heightCm / 100) * (user.heightCm / 100))
      : 0;

  useFocusEffect(
    React.useCallback(() => {
      avatarAnim.value = 0;
      avatarAnim.value = withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) });
      return undefined;
    }, [avatarAnim])
  );

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${avatarAnim.value * 360}deg` }],
    borderRadius: interpolate(avatarAnim.value, [0, 1], [16, 35]),
  }));

  const pickAvatar = React.useCallback(() => {
    navigation.navigate('EditProfile');
  }, [navigation]);

  const menuItems: MenuItem[] = [
    { label: 'Settings', icon: 'cog-outline', action: () => navigation.navigate('Settings') },
    { label: 'Achievements', icon: 'trophy-outline', action: () => {} },
    { label: 'Membership', icon: 'credit-card-outline', action: () => {} },
    { label: 'Notifications', icon: 'bell-outline', action: () => {} },
    { label: 'Help & FAQ', icon: 'help-circle-outline', action: () => {} },
  ];

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: S.lg, gap: S.lg, paddingBottom: 100 }}
      >
        <Text style={[s.h1, { color: TC.text }]}>Profile</Text>

        <View style={s.avatarCard}>
          <View style={s.avatarWrap}>
            <Animated.View style={[s.avatar, avatarStyle]}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={s.avatarImg} resizeMode="cover" />
              ) : (
                <Text style={s.avatarFallback}>{user?.name?.[0] ?? 'A'}</Text>
              )}
            </Animated.View>
            <TouchableOpacity style={s.avatarEditBtn} onPress={pickAvatar}>
              <MaterialCommunityIcons name="pencil-outline" size={12} color={C.primary} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.name, { color: TC.text }]}>{user?.name}</Text>
            <Text style={[s.email, { color: TC.muted }]}>{user?.email}</Text>
            <View style={s.tierBadge}>
              <MaterialCommunityIcons name="trophy-outline" size={12} color={C.primary} />
              <Text style={s.tierTxt}>{user?.tier}</Text>
            </View>
          </View>
          <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={s.editTxt}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={s.infoWrap}>
          <TouchableOpacity style={s.menuItem} onPress={() => setShowPersonalInfo((v) => !v)}>
            <View style={s.menuMain}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#fff" />
              <Text style={[s.menuTxt, { color: TC.text }]}>Personal Information</Text>
            </View>
            <MaterialCommunityIcons
              name={showPersonalInfo ? 'chevron-up' : 'chevron-right'}
              size={22}
              color={C.muted}
            />
          </TouchableOpacity>
          {showPersonalInfo && (
            <View style={s.infoCard}>
              {[
                ['Full Name', user?.name || '-'],
                ['Email', user?.email || '-'],
                ['Phone', user?.phone || '-'],
                ['Height', user?.heightCm ? `${user.heightCm} cm` : '-'],
                ['Weight', user?.weightKg ? `${user.weightKg} kg` : '-'],
                ['BMI', bmi > 0 ? bmi.toFixed(1) : '-'],
                ['Medical Conditions', user?.medicalConditions || '-'],
                ['Emergency Contact', user?.emergencyContact || '-'],
                ['Biography', user?.biography || '-'],
              ].map(([label, value]) => (
                <View key={String(label)} style={s.infoRow}>
                  <Text style={s.infoLabel}>{label}</Text>
                  <Text style={[s.infoValue, { color: TC.text }]}>{value}</Text>
                </View>
              ))}
              <TouchableOpacity
                style={s.changePasswordBtn}
                onPress={() => navigation.navigate('ChangePassword')}
              >
                <MaterialCommunityIcons name="lock-reset" size={16} color={C.primary} />
                <Text style={s.changePasswordTxt}>Change Password</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} style={s.menuItem} onPress={item.action}>
            <View style={s.menuMain}>
              <MaterialCommunityIcons name={item.icon} size={20} color="#fff" />
              <Text style={[s.menuTxt, { color: TC.text }]}>{item.label}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={C.muted} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={s.logoutBtn}
          onPress={() =>
            Alert.alert('Log Out', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log Out', style: 'destructive', onPress: logout },
            ])
          }
        >
          <Text style={s.logoutTxt}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  h1: { fontSize: F.x3, fontWeight: '900', color: '#fff' },
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.surface,
    borderRadius: R.xl,
    padding: S.md,
    borderWidth: 1,
    borderColor: C.border,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallback: { fontSize: 36, color: '#fff', fontWeight: '900' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 35 },
  avatarEditBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: F.lg, fontWeight: '900', color: '#fff' },
  email: { fontSize: F.sm, color: C.muted, marginTop: 2 },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.primary + '22',
    borderWidth: 1,
    borderColor: C.primary + '44',
    borderRadius: R.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  tierTxt: { color: C.primary, fontSize: F.xs, fontWeight: '800' },
  editBtn: { backgroundColor: C.surface2, paddingHorizontal: S.md, paddingVertical: 8, borderRadius: R.md },
  editTxt: { color: C.primary, fontSize: F.sm, fontWeight: '700' },
  infoWrap: { gap: S.sm },
  infoCard: {
    backgroundColor: C.surface,
    borderRadius: R.xl,
    padding: S.md,
    borderWidth: 1,
    borderColor: C.border,
    gap: S.sm,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: S.sm },
  infoLabel: { fontSize: F.sm, color: C.muted, fontWeight: '700' },
  infoValue: { flex: 1, textAlign: 'right', fontSize: F.sm, color: '#fff', fontWeight: '700' },
  changePasswordBtn: {
    marginTop: S.xs,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.primary + '44',
    borderRadius: R.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  changePasswordTxt: { color: C.primary, fontSize: F.sm, fontWeight: '800' },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: R.xl,
    paddingHorizontal: S.md,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  menuMain: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  menuTxt: { fontSize: F.base, color: '#fff', fontWeight: '600' },
  logoutBtn: {
    backgroundColor: '#EF444420',
    borderWidth: 1.5,
    borderColor: '#EF444455',
    borderRadius: R.md,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: S.sm,
  },
  logoutTxt: { color: '#EF4444', fontSize: F.lg, fontWeight: '800' },
});

