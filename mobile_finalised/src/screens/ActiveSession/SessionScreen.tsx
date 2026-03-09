import React from 'react';
import { Alert, AppState, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useUI } from '../../store/ui';
import { useGyms } from '../../store/gyms';
import { F, R, S, useThemeColors } from '../../theme';
import type { HomeStack } from '../../navigation/types';
import { computeElapsedMs, useActiveSession } from '../../features/session/sessionSlice';
import { SessionStatsRow } from '../Session/components/SessionStatsRow';
import { EffortTimer } from '../Session/components/EffortTimer';

type Props = NativeStackScreenProps<HomeStack, 'Session'>;

function fmtHms(totalMs: number): string {
  const totalSec = Math.floor(totalMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function SessionScreen({ navigation, route }: Props) {
  const TC = useThemeColors();
  const timerStyle = useUI((state) => state.timerStyle);
  const gyms = useGyms((state) => state.gyms);
  const fetchGyms = useGyms((state) => state.fetchGyms);

  const status = useActiveSession((state) => state.status);
  const gymId = useActiveSession((state) => state.gymId);
  const sessionId = useActiveSession((state) => state.sessionId);
  const sessionStartAt = useActiveSession((state) => state.sessionStartAt);
  const pausedAt = useActiveSession((state) => state.pausedAt);
  const totalPausedMs = useActiveSession((state) => state.totalPausedMs);
  const startSession = useActiveSession((state) => state.startSession);
  const pauseSession = useActiveSession((state) => state.pauseSession);
  const resumeSession = useActiveSession((state) => state.resumeSession);
  const stopSession = useActiveSession((state) => state.stopSession);
  const finalizeCheckOut = useActiveSession((state) => state.finalizeCheckOut);

  const [nowMs, setNowMs] = React.useState<number>(() => Date.now());
  const [online, setOnline] = React.useState(true);

  const routeGymId = route.params.gymId;
  const routeSessionId = route.params.sessionId;

  React.useEffect(() => {
    if (status === 'idle') {
      if (!routeGymId) return;
      startSession({ gymId: routeGymId, sessionId: routeSessionId });
    }
  }, [routeGymId, routeSessionId, startSession, status]);

  React.useEffect(() => {
    if (gyms.length > 0) return;
    if (!gymId) return;
    void fetchGyms();
  }, [fetchGyms, gymId, gyms.length]);

  React.useEffect(() => {
    setNowMs(Date.now());
    if (status !== 'running' && status !== 'paused') return;

    const tick = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(tick);
  }, [status]);

  React.useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') setNowMs(Date.now());
    });
    return () => sub.remove();
  }, []);

  const elapsedMs = React.useMemo(
    () =>
      computeElapsedMs(
        {
          status,
          gymId,
          sessionId,
          sessionStartAt,
          pausedAt,
          totalPausedMs,
        },
        nowMs
      ),
    [gymId, nowMs, pausedAt, sessionId, sessionStartAt, status, totalPausedMs]
  );

  const elapsedSec = Math.floor(elapsedMs / 1000);
  const totalElapsedMs = React.useMemo(() => {
    if (!sessionStartAt) return 0;
    return Math.max(nowMs - sessionStartAt, 0);
  }, [nowMs, sessionStartAt]);
  const startedAtLabel = React.useMemo(() => {
    if (!sessionStartAt) return '--:--';
    return new Date(sessionStartAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [sessionStartAt]);

  const activeGymName = React.useMemo(() => {
    const activeGymId = gymId ?? routeGymId;
    if (!activeGymId) return 'Apex Fitness';
    return gyms.find((gym) => gym.id === activeGymId)?.name ?? 'Apex Fitness';
  }, [gymId, gyms, routeGymId]);

  const isRunning = status === 'running';
  const canPauseResume = status === 'running' || status === 'paused';

  const endSession = React.useCallback(() => {
    Alert.alert('End Session', `Session duration ${fmtHms(totalElapsedMs)}. End now?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await finalizeCheckOut();
            } catch {
              // Allow local session cleanup even if server checkout fails.
            } finally {
              stopSession();
              navigation.replace('Home');
            }
          })();
        },
      },
    ]);
  }, [finalizeCheckOut, navigation, stopSession, totalElapsedMs]);

  const toggleMain = React.useCallback(() => {
    if (status === 'running') {
      pauseSession();
      return;
    }
    if (status === 'paused') {
      resumeSession();
    }
  }, [pauseSession, resumeSession, status]);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]}>
      <View style={s.header}>
        <View>
          <View style={s.titleRow}>
            <View style={[s.dot, { backgroundColor: TC.primary }]} />
            <Text style={[s.title, { color: TC.text }]}>Active Session</Text>
          </View>
          <Text style={[s.gymName, { color: TC.primary }]}>{activeGymName}</Text>
        </View>
        <View style={[s.onlineWrap, { backgroundColor: TC.surface, borderColor: TC.primary + '33' }]}>
          <Text style={[s.onlineTxt, { color: online ? TC.primary : TC.muted }]}>{online ? 'Online' : 'Offline'}</Text>
          <Switch
            value={online}
            onValueChange={setOnline}
            thumbColor="#fff"
            trackColor={{ false: TC.surface2, true: TC.primary }}
          />
          <Text style={[s.sessionTimer, { color: TC.text }]}>{fmtHms(totalElapsedMs)}</Text>
        </View>
      </View>

      <View style={s.body}>
        <EffortTimer
          elapsedSec={elapsedSec}
          running={isRunning}
          timerStyle={timerStyle}
          mutedColor={TC.muted}
          borderColor={TC.border}
          palette={{
            normal: TC.primary,
            focus: '#FDBA74',
            hard: '#FB923C',
            overdrive: '#EF4444',
            extreme: '#DC2626',
          }}
        />

        <SessionStatsRow
          startedAtLabel={startedAtLabel}
          activity={isRunning ? 'Training In Progress' : 'Paused Workout'}
          gymName={activeGymName}
        />
      </View>

      <View style={s.actions}>
        <TouchableOpacity
          style={[s.btn, { backgroundColor: TC.surface, borderColor: TC.border, opacity: canPauseResume ? 1 : 0.5 }]}
          onPress={toggleMain}
          disabled={!canPauseResume}
        >
          <Text style={[s.btnTxt, { color: TC.text }]}>{isRunning ? 'Pause' : 'Resume'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.checkoutBtn, { backgroundColor: '#E74504' }]} onPress={endSession}>
          <MaterialCommunityIcons name="logout" size={18} color="#fff" />
          <Text style={s.checkoutTxt}>Check-Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    paddingHorizontal: S.lg,
    paddingTop: S.md,
    paddingBottom: S.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: F.xl, fontWeight: '900' },
  gymName: { marginTop: 2, fontSize: F.sm, fontWeight: '700' },
  onlineWrap: {
    borderWidth: 1,
    borderRadius: R.full,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 2,
    minWidth: 112,
  },
  onlineTxt: { fontSize: F.xs, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  sessionTimer: { fontSize: 11, fontWeight: '800', fontVariant: ['tabular-nums'] },
  body: { flex: 1, paddingHorizontal: S.lg, gap: S.lg },
  actions: { paddingHorizontal: S.lg, paddingBottom: S.xl, gap: S.sm },
  btn: {
    height: 52,
    borderRadius: R.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: { fontSize: F.md, fontWeight: '800' },
  checkoutBtn: {
    height: 56,
    borderRadius: R.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  checkoutTxt: { color: '#fff', fontSize: F.lg, fontWeight: '900' },
});
