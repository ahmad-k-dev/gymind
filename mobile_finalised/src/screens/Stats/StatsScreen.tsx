import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import { useIsFocused, useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../store/auth';
import { F, R, S, useThemeColors } from '../../theme';
import type { RootStack, TabStack } from '../../navigation/types';
import { StatsHeader } from './components/StatsHeader';
import { WeeklyActivity } from './components/WeeklyActivity';
import { Attendance30Days } from './components/Attendance30Days';
import { LinkedGymCard } from './components/LinkedGymCard';
import { getMyHistoryApi } from '../../services/api/sessionApi';
import { getMyMembershipsApi } from '../../services/api/membershipApi';
import { useGyms } from '../../store/gyms';
import { buildComputedStats, mapLinkedGymFromMembership } from '../../services/api/mappers';
import { ATTENDANCE_LAST_30_DAYS, LINKED_GYM, WEEKLY_ACTIVITY } from '../../data/mockStats';
import type { AttendanceDay, LinkedGym, WeeklyActivityPoint } from '../../types/stats';

type StatsNav = CompositeNavigationProp<
  BottomTabNavigationProp<TabStack, 'StatsTab'>,
  NativeStackNavigationProp<RootStack>
>;

interface StatTile {
  id: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  value: string;
  label: string;
  delta: string;
}

const StatCard = React.memo(function StatCard({ item }: { item: StatTile }) {
  const TC = useThemeColors();
  return (
    <View style={[s.statCard, { backgroundColor: TC.surface, borderColor: TC.primary + '29' }]}>
      <View style={s.statHead}>
        <MaterialCommunityIcons name={item.icon} size={20} color={TC.primary} />
        <View style={s.deltaChip}>
          <Text style={s.deltaTxt}>{item.delta}</Text>
        </View>
      </View>
      <Text style={[s.statValue, { color: TC.text }]}>{item.value}</Text>
      <Text style={[s.statLabel, { color: TC.muted }]}>{item.label}</Text>
    </View>
  );
});

export function StatsScreen() {
  const TC = useThemeColors();
  const navigation = useNavigation<StatsNav>();
  const isFocused = useIsFocused();
  const user = useAuth((state) => state.user);
  const gyms = useGyms((state) => state.gyms);
  const fetchGyms = useGyms((state) => state.fetchGyms);

  const [weeklyActivity, setWeeklyActivity] = React.useState<readonly WeeklyActivityPoint[]>(WEEKLY_ACTIVITY);
  const [attendance30, setAttendance30] = React.useState<readonly AttendanceDay[]>(ATTENDANCE_LAST_30_DAYS);
  const [linkedGym, setLinkedGym] = React.useState<LinkedGym>(LINKED_GYM);

  React.useEffect(() => {
    if (gyms.length === 0) {
      void fetchGyms();
    }
  }, [fetchGyms, gyms.length]);

  React.useEffect(() => {
    let mounted = true;

    async function hydrateStats() {
      try {
        const [history, memberships] = await Promise.all([getMyHistoryApi(), getMyMembershipsApi()]);
        if (!mounted) return;

        const computed = buildComputedStats(history);
        setWeeklyActivity(computed.weeklyMinutes as readonly WeeklyActivityPoint[]);
        setAttendance30(computed.attendanceLast30 as readonly AttendanceDay[]);

        const mappedLinkedGym = mapLinkedGymFromMembership(memberships, gyms);
        if (mappedLinkedGym) {
          setLinkedGym(mappedLinkedGym);
        }
      } catch {
        // Keep fallback view models to ensure the screen remains usable offline.
      }
    }

    void hydrateStats();

    return () => {
      mounted = false;
    };
  }, [gyms]);

  const statTiles = React.useMemo<readonly StatTile[]>(
    () => [
      { id: 'workouts', icon: 'dumbbell', value: String(user?.workouts ?? 0), label: 'Total Workouts', delta: '+12%' },
      { id: 'hours', icon: 'timer-outline', value: `${user?.hours ?? 0}`, label: 'Total Hours', delta: '+5%' },
    ],
    [user?.hours, user?.workouts]
  );

  const goToProfile = React.useCallback(() => {
    navigation.navigate('ProfileModal', { screen: 'Profile' });
  }, [navigation]);

  const goToLinkedGym = React.useCallback(() => {
    navigation.navigate('HomeTab', { screen: 'GymProfile', params: { gymId: linkedGym.id } });
  }, [linkedGym.id, navigation]);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <StatsHeader user={user} isFocused={isFocused} onOpenSettings={goToProfile} />

        <View style={s.statsGrid}>
          {statTiles.map((item) => (
            <StatCard key={item.id} item={item} />
          ))}
        </View>

        <View style={s.sectionPad}>
          <WeeklyActivity points={weeklyActivity} />
        </View>
        <View style={s.sectionPad}>
          <Attendance30Days days={attendance30} />
        </View>
        <View style={s.sectionPad}>
          <LinkedGymCard gym={linkedGym} onPress={goToLinkedGym} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { paddingBottom: 110, gap: S.lg },
  statsGrid: {
    paddingHorizontal: S.lg,
    flexDirection: 'row',
    gap: S.sm,
  },
  sectionPad: { paddingHorizontal: S.lg },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FD6A0829',
    borderRadius: R.lg,
    backgroundColor: '#161616',
    padding: S.md,
    gap: 6,
  },
  statHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  deltaChip: {
    backgroundColor: '#22C55E22',
    borderRadius: R.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deltaTxt: { color: '#22C55E', fontSize: 10, fontWeight: '800' },
  statValue: { color: '#fff', fontSize: F.x3, fontWeight: '900' },
  statLabel: { color: '#9CA3AF', fontSize: F.xs, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '700' },
});
