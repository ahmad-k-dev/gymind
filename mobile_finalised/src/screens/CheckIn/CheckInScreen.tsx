import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { C, S, R, F, useThemeColors } from '../../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStack } from '../../navigation/types';
import { selectIsSessionActive, useActiveSession } from '../../features/session/sessionSlice';

type Props = NativeStackScreenProps<HomeStack, 'CheckIn'>;

export function CheckInScreen({ navigation, route }: Props) {
  const TC = useThemeColors();
  const line = useSharedValue(0);
  const pulse = useSharedValue(1);
  const isSessionActive = useActiveSession(selectIsSessionActive);
  const activeGymId = useActiveSession((state) => state.gymId);
  const activeSessionId = useActiveSession((state) => state.sessionId);
  const startSession = useActiveSession((state) => state.startSession);

  useEffect(() => {
    line.value = withRepeat(
      withSequence(withTiming(1, { duration: 1800 }), withTiming(0, { duration: 0 })),
      -1,
      false
    );
    pulse.value = withRepeat(
      withSequence(withTiming(1.03, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      false
    );
  }, [line, pulse]);

  const lineStyle = useAnimatedStyle(() => ({ transform: [{ translateY: line.value * 220 }] }));
  const qrStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const { gymId } = route.params;

  useEffect(() => {
    if (!isSessionActive) return;
    navigation.replace('Session', {
      gymId: activeGymId ?? gymId,
      sessionId: activeSessionId ?? undefined,
    });
  }, [activeGymId, activeSessionId, gymId, isSessionActive, navigation]);

  const onCheckIn = React.useCallback(() => {
    if (isSessionActive) {
      navigation.replace('Session', {
        gymId: activeGymId ?? gymId,
        sessionId: activeSessionId ?? undefined,
      });
      return;
    }

    const sessionId = `sess_${Date.now()}`;
    startSession({ gymId, sessionId });
    navigation.replace('Session', { gymId, sessionId });
  }, [activeGymId, activeSessionId, gymId, isSessionActive, navigation, startSession]);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]}>
      <View style={s.nav}>
        <TouchableOpacity style={s.backRow} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={TC.muted} />
          <Text style={s.back}>Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Gym Access</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={s.center}>
        <Animated.View style={[s.qrBox, qrStyle]}>
          <View style={[s.corner, s.tl]} />
          <View style={[s.corner, s.tr]} />
          <View style={[s.corner, s.bl]} />
          <View style={[s.corner, s.br]} />
          <MaterialCommunityIcons name="qrcode-scan" size={42} color="#111" style={{ marginBottom: 12 }} />
          <View style={s.grid}>
            {Array.from({ length: 36 }).map((_, i) => (
              <View key={i} style={[s.cell, [0, 2, 5, 7, 9, 11, 14, 16, 20, 22, 25, 27, 30, 32, 35].includes(i) ? s.cellOff : s.cellOn]} />
            ))}
          </View>
          <Animated.View style={[s.scanLine, lineStyle]} />
        </Animated.View>

        <View style={s.memberBox}>
          <Text style={s.memLabel}>MEMBERSHIP ID</Text>
          <Text style={s.memId}>#8829-X</Text>
          <View style={s.tierBadge}>
            <MaterialCommunityIcons name="trophy-outline" size={14} color={C.primary} />
            <Text style={s.tierTxt}>ELITE MEMBER</Text>
          </View>
        </View>
      </View>

      <View style={s.footer}>
        <TouchableOpacity style={s.checkBtn} onPress={onCheckIn}>
          <View style={s.actionInner}>
            <MaterialCommunityIcons name="check-circle-outline" size={18} color="#fff" />
            <Text style={s.checkBtnTxt}>Check In Now</Text>
          </View>
        </TouchableOpacity>
        <Text style={s.hint}>Present this QR code to the scanner at the entrance.</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.lg, paddingVertical: S.md },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  back: { color: C.muted, fontSize: F.base, fontWeight: '600' },
  title: { fontSize: F.lg, fontWeight: '800', color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: S.xl },
  qrBox: { width: 260, height: 260, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', shadowColor: C.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: C.primary, borderWidth: 4 },
  tl: { top: -4, left: -4, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  tr: { top: -4, right: -4, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  bl: { bottom: -4, left: -4, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  br: { bottom: -4, right: -4, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 180, gap: 3 },
  cell: { width: 27, height: 27, borderRadius: 3 },
  cellOn: { backgroundColor: '#111' },
  cellOff: { backgroundColor: '#E5E7EB' },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2.5, backgroundColor: C.primary, shadowColor: C.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6 },
  memberBox: { alignItems: 'center', gap: 8 },
  memLabel: { fontSize: F.xs, color: C.muted, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  memId: { fontSize: F.x3, fontWeight: '900', color: '#fff' },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.primary + '22', borderWidth: 1, borderColor: C.primary + '44', borderRadius: R.full, paddingHorizontal: S.md, paddingVertical: 5 },
  tierTxt: { fontSize: F.sm, fontWeight: '800', color: C.primary, letterSpacing: 1 },
  footer: { paddingHorizontal: S.lg, paddingBottom: S.xl, gap: S.md },
  checkBtn: { height: 58, backgroundColor: C.primary, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  actionInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkBtnTxt: { color: '#fff', fontSize: F.lg, fontWeight: '900' },
  hint: { textAlign: 'center', fontSize: F.xs, color: C.muted },
});

