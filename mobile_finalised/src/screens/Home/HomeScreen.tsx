import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useAuth } from '../../store/auth';
import { useGyms } from '../../store/gyms';
import { useUI } from '../../store/ui';
import { C, S, R, F, useThemeColors } from '../../theme';
import { AppLogo } from '../../components/ui/AppLogo';
import { AnnouncementBanner } from '../../components/ui/AnnouncementBanner';
import { selectVisibleAnnouncement, useAnnouncement } from '../../features/announcement/announcementSlice';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStack, RootStack } from '../../navigation/types';
import type { Gym } from '../../types';

type Nav = NativeStackNavigationProp<HomeStack, 'Home'>;

const TC: Record<string, string> = { Low: '#22C55E', Medium: '#EAB308', High: '#FD6A08' };

const GymCard = React.memo(function GymCard({
  gym,
  onPressGym,
}: {
  gym: Gym;
  onPressGym: (id: string) => void;
}) {
  const handlePress = useCallback(() => onPressGym(gym.id), [gym.id, onPressGym]);

  return (
    <TouchableOpacity style={gc.card} onPress={handlePress} activeOpacity={0.85}>
      <Image source={{ uri: gym.image }} style={gc.img} resizeMode="cover" />
      <View style={gc.overlay} />
      <View style={gc.badge}>
        <View style={[gc.dot, { backgroundColor: TC[gym.traffic] }]} />
        <Text style={[gc.trafficTxt, { color: TC[gym.traffic] }]}>{gym.traffic}</Text>
      </View>
      <View style={gc.info}>
        <Text style={gc.name} numberOfLines={1}>
          {gym.name}
        </Text>
        <View style={gc.metaRow}>
          <View style={gc.metaInline}>
            <MaterialCommunityIcons name="map-marker-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={gc.loc}>{gym.distance}</Text>
          </View>
          <View style={gc.metaInline}>
            <MaterialCommunityIcons name="star" size={13} color="#fff" />
            <Text style={gc.rating}>{gym.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const GymRow = React.memo(function GymRow({
  gym,
  onPressGym,
}: {
  gym: Gym;
  onPressGym: (id: string) => void;
}) {
  const handlePress = useCallback(() => onPressGym(gym.id), [gym.id, onPressGym]);

  return (
    <TouchableOpacity style={gr.row} onPress={handlePress} activeOpacity={0.8}>
      <Image source={{ uri: gym.image }} style={gr.img} resizeMode="cover" />
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={gr.name} numberOfLines={1}>
            {gym.name}
          </Text>
          <Text
            style={[
              gr.cap,
              { color: gym.capacity < 50 ? C.green : gym.capacity < 75 ? C.yellow : C.primary },
            ]}
          >
            {gym.capacity}%
          </Text>
        </View>
        <Text style={gr.addr} numberOfLines={1}>
          {gym.address}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {gym.tags.slice(0, 2).map((t) => (
              <View key={t} style={gr.tag}>
                <Text style={gr.tagTxt}>{t}</Text>
              </View>
            ))}
          </View>
          <Text style={gr.price}>${gym.price}/mo</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={C.muted} />
    </TouchableOpacity>
  );
});

const RowSeparator = React.memo(function RowSeparator() {
  return <View style={{ height: S.sm }} />;
});

export function HomeScreen({ navigation }: { navigation: Nav }) {
  const TC = useThemeColors();
  const insets = useSafeAreaInsets();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStack>>();
  const user = useAuth((s) => s.user);
  const { gyms, loading, fetchGyms, select, search, results } = useGyms();
  const notif = useUI((s) => s.notifications);
  const location = useUI((s) => s.location);
  const announcement = useAnnouncement(selectVisibleAnnouncement);
  const dismissAnnouncement = useAnnouncement((s) => s.dismissAnnouncement);

  const notifScale = useSharedValue(1);
  const pinY = useSharedValue(-30);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    fetchGyms();
    pinY.value = withSpring(0, { damping: 8 });
    notifScale.value = withRepeat(
      withSequence(withTiming(1.25, { duration: 700 }), withTiming(1, { duration: 700 })),
      3,
      false
    );
  }, [fetchGyms, notifScale, pinY]);

  const pinStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pinY.value }] }));
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: notifScale.value }] }));

  const goGym = useCallback(
    (id: string) => {
      select(id);
      navigation.navigate('GymProfile', { gymId: id });
    },
    [navigation, select]
  );

  const onDismissAnnouncement = useCallback(() => {
    void dismissAnnouncement();
  }, [dismissAnnouncement]);

  const spotlight = gyms.slice(0, 3);
  const nearby = results();

  const renderSpotlightItem = useCallback<ListRenderItem<Gym>>(
    ({ item }) => <GymCard gym={item} onPressGym={goGym} />,
    [goGym]
  );

  const renderNearbyItem = useCallback<ListRenderItem<Gym>>(
    ({ item }) => <GymRow gym={item} onPressGym={goGym} />,
    [goGym]
  );

  const onSearchChange = useCallback(
    (query: string) => {
      search(query);
    },
    [search]
  );

  const onFabPress = useCallback(() => {
    rootNavigation.navigate('Main', { screen: 'AITab' });
  }, [rootNavigation]);

  return (
    <SafeAreaView style={[hs.safe, { backgroundColor: TC.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={hs.scrollContent}>
        <View style={hs.header}>
          <View style={hs.left}>
            <View style={hs.avatar}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={hs.avatarImg} resizeMode="cover" />
              ) : (
                <Text style={hs.avatarTxt}>{user?.name?.[0] ?? 'A'}</Text>
              )}
            </View>
            <View>
              <Text style={[hs.greet, { color: TC.text }]}>Hello, {user?.name?.split(' ')[0] ?? 'there'}</Text>
              <View style={hs.statusWrap}>
                <View style={hs.statusDot} />
                <Text style={hs.mem}>Active Member</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={hs.bell}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={TC.text} />
            {notif > 0 && (
              <Animated.View style={[hs.notifDot, badgeStyle]}>
                <Text style={hs.notifTxt}>{notif}</Text>
              </Animated.View>
            )}
          </TouchableOpacity>
        </View>

        <View style={hs.logoRow}>
          <AppLogo containerStyle={hs.logo} />
        </View>

        {announcement && (
          <AnnouncementBanner announcement={announcement} onDismiss={onDismissAnnouncement} />
        )}

        <TouchableOpacity style={hs.locRow}>
          <Animated.View style={pinStyle}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color="#fff" />
          </Animated.View>
          <Text style={hs.locTxt} numberOfLines={1}>
            {location}
          </Text>
          <View style={hs.metaInline}>
            <Text style={hs.change}>Change</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={C.primary} />
          </View>
        </TouchableOpacity>

        <View style={hs.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={18} color={C.muted} />
          <TextInput
            ref={searchInputRef}
            style={[hs.searchInput, { color: TC.text }]}
            placeholder="Search gyms or tags…"
            placeholderTextColor={TC.muted}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
        </View>

        <View style={hs.sec}>
          <View style={hs.secHead}>
            <View style={hs.metaInline}>
              <MaterialCommunityIcons name="star" size={14} color="#fff" />
              <Text style={hs.secTitle}>TOP GYMS</Text>
            </View>
          </View>
          {loading ? (
            <View style={hs.loader}>
              <Text style={[hs.loadingText, { color: TC.muted }]}>Loading…</Text>
            </View>
          ) : (
            <FlatList
              data={spotlight}
              keyExtractor={(g) => g.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={hs.spotlightList}
              renderItem={renderSpotlightItem}
              scrollEventThrottle={16}
            />
          )}
          {!loading && (
            <View style={hs.seeAllWrap}>
              <TouchableOpacity>
                <Text style={hs.secBtn}>See All</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[hs.sec, { paddingHorizontal: S.lg }]}>
          <View style={hs.secHead}>
            <Text style={hs.secTitle}>NEARBY</Text>
          </View>
          {loading ? (
            <View style={hs.loader}>
              <Text style={{ color: TC.muted }}>Loading…</Text>
            </View>
          ) : (
            <FlatList
              data={nearby}
              keyExtractor={(g) => g.id}
              scrollEnabled={false}
              ItemSeparatorComponent={RowSeparator}
              renderItem={renderNearbyItem}
            />
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={[hs.fab, { bottom: 100 + insets.bottom }]} onPress={onFabPress}>
        <MaterialCommunityIcons name="robot-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const hs = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarTxt: { color: '#fff', fontSize: F.lg, fontWeight: '900' },
  greet: { fontSize: F.lg, fontWeight: '800', color: '#fff' },
  statusWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
  },
  mem: { fontSize: F.xs, color: C.primary, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  bell: { padding: 8, backgroundColor: C.surface, borderRadius: 12, position: 'relative' },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: C.bg,
  },
  notifTxt: { color: '#fff', fontSize: 7, fontWeight: '900' },
  logoRow: { paddingHorizontal: S.lg, marginBottom: S.sm },
  logo: { width: '38%' },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: S.lg,
    marginBottom: S.sm,
    backgroundColor: C.surface,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  locTxt: { flex: 1, color: '#fff', fontSize: F.sm, fontWeight: '600' },
  change: { color: C.primary, fontSize: F.sm, fontWeight: '700' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: S.lg,
    marginBottom: S.lg,
    backgroundColor: C.surface,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: F.base },
  sec: { marginBottom: S.xl },
  secHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: S.md,
    paddingHorizontal: S.lg,
  },
  secTitle: { fontSize: F.sm, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  secBtn: { fontSize: F.sm, fontWeight: '700', color: C.primary },
  seeAllWrap: { marginTop: S.sm, paddingHorizontal: S.lg, alignItems: 'flex-end' },
  loader: { height: 180, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: C.muted, fontSize: F.base },
  spotlightList: { paddingHorizontal: S.lg, gap: S.md },
  fab: {
    position: 'absolute',
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  metaInline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});

const gc = StyleSheet.create({
  card: {
    width: 270,
    height: 220,
    borderRadius: R.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: C.primary + '55',
    marginRight: S.md,
  },
  img: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: R.full,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  trafficTxt: { fontSize: F.xs, fontWeight: '700', textTransform: 'uppercase' },
  info: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: S.md, backgroundColor: 'rgba(0,0,0,0.6)' },
  name: { fontSize: F.lg, fontWeight: '900', color: '#fff', marginBottom: 3 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaInline: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  loc: { fontSize: F.sm, color: 'rgba(255,255,255,0.7)' },
  rating: { fontSize: F.sm, color: '#fff', fontWeight: '700' },
});

const gr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: C.border,
    padding: S.sm,
    gap: S.md,
  },
  img: { width: 76, height: 76, borderRadius: R.md },
  name: { fontSize: F.sm, fontWeight: '800', color: '#fff', flex: 1, marginRight: 6 },
  cap: { fontSize: F.xs, fontWeight: '800', textTransform: 'uppercase' },
  addr: { fontSize: F.xs, color: C.muted },
  tag: { backgroundColor: 'rgba(255,255,255,0.07)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagTxt: { fontSize: 9, color: C.muted, fontWeight: '600' },
  price: { fontSize: F.sm, fontWeight: '800', color: C.primary },
});
