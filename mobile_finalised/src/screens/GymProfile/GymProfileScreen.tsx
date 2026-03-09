import React from 'react';
import { Alert, Share, StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useGyms } from '../../store/gyms';
import { useUI } from '../../store/ui';
import { C, F, R, S, useThemeColors } from '../../theme';
import { normalizeGymProfile } from '../../data/mockGyms';
import type { Gym, Offer } from '../../types';
import type { HomeStack } from '../../navigation/types';
import { selectIsSessionActive, useActiveSession } from '../../features/session/sessionSlice';
import type { MapPreference } from '../../features/ui/ui.types';
import { GymHero } from './components/GymHero';
import { TrafficBadge } from './components/TrafficBadge';
import { EnrollButton } from './components/EnrollButton';
import { AboutSection } from './components/AboutSection';
import { OffersList } from './components/OffersList';
import { MapPreview } from './components/MapPreview';
import { SocialLinksExpander } from './components/SocialLinksExpander';
import { MapPickerSheet } from '../../components/ui/MapPickerSheet';
import { buildShareableMapsUrl, canOpenGoogleMaps, openMaps } from '../../utils/openMaps';

type Props = NativeStackScreenProps<HomeStack, 'GymProfile'>;

const FALLBACK_OFFERS: Offer[] = [
  {
    id: 'starter',
    label: 'Starter',
    title: 'Free Class Access',
    description: 'Get one free premium class when you enroll this week.',
    highlighted: true,
  },
];

export function GymProfileScreen({ navigation, route }: Props) {
  const TC = useThemeColors();
  const { gymId } = route.params;
  const { gyms, fetchGyms } = useGyms();
  const mapPreference = useUI((state) => state.mapPreference);
  const setMapPreference = useUI((state) => state.setMapPreference);
  const isFocused = useIsFocused();
  const isSessionActive = useActiveSession(selectIsSessionActive);
  const activeGymId = useActiveSession((state) => state.gymId);
  const activeSessionId = useActiveSession((state) => state.sessionId);
  const [mapPickerVisible, setMapPickerVisible] = React.useState(false);
  const [googleMapsAvailable, setGoogleMapsAvailable] = React.useState(false);

  React.useEffect(() => {
    if (gyms.length === 0) {
      void fetchGyms();
    }
  }, [fetchGyms, gyms.length]);

  const gym = React.useMemo(() => {
    const found = gyms.find((item) => item.id === gymId);
    return found ? normalizeGymProfile(found) : null;
  }, [gymId, gyms]);

  const openCheckInOrSession = React.useCallback(
    (targetGymId: string) => {
      if (isSessionActive) {
        navigation.navigate('Session', {
          gymId: activeGymId ?? targetGymId,
          sessionId: activeSessionId ?? undefined,
        });
        return;
      }

      navigation.navigate('CheckIn', { gymId: targetGymId });
    },
    [activeGymId, activeSessionId, isSessionActive, navigation]
  );

  const onShare = React.useCallback(async () => {
    if (!gym) return;
    const mapUrl = buildShareableMapsUrl({
      name: gym.name,
      lat: gym.coords?.latitude,
      lng: gym.coords?.longitude,
      address: gym.address,
    });
    await Share.share({
      message: `${gym.name}\n${gym.address}\n${mapUrl}`,
    });
  }, [gym]);

  const onFavorite = React.useCallback(() => {
    Alert.alert('Saved', 'Gym added to favorites.');
  }, []);

  const onEnroll = React.useCallback(() => {
    if (!gym) return;
    openCheckInOrSession(gym.id);
  }, [gym, openCheckInOrSession]);

  const onOpenMaps = React.useCallback(async () => {
    if (!gym) return;
    const args = {
      name: gym.name,
      lat: gym.coords?.latitude,
      lng: gym.coords?.longitude,
      address: gym.address,
    };

    if (mapPreference !== 'default') {
      await openMaps({
        ...args,
        preference: mapPreference,
      });
      return;
    }

    const googleAvailable = await canOpenGoogleMaps();
    setGoogleMapsAvailable(googleAvailable);
    setMapPickerVisible(true);
  }, [gym, mapPreference]);

  const onSelectMapPreference = React.useCallback(
    async (selectedPreference: MapPreference, rememberChoice: boolean) => {
      if (!gym) return;

      if (rememberChoice) {
        setMapPreference(selectedPreference);
      }

      setMapPickerVisible(false);
      await openMaps({
        name: gym.name,
        lat: gym.coords?.latitude,
        lng: gym.coords?.longitude,
        address: gym.address,
        preference: selectedPreference,
      });
    },
    [gym, setMapPreference]
  );

  const onCloseMapPicker = React.useCallback(() => {
    setMapPickerVisible(false);
  }, []);

  const mapPickerOptions = React.useMemo(
    () => ({
      default: true,
      apple: Platform.OS === 'ios',
      google: googleMapsAvailable,
    }),
    [googleMapsAvailable]
  );

  if (!gym) {
    return (
      <View style={[s.notFound, { backgroundColor: TC.bg }]}>
        <Text style={[s.notFoundText, { color: TC.muted }]}>Gym not found</Text>
      </View>
    );
  }

  const offers = gym.offers ?? FALLBACK_OFFERS;
  const mapPreviewImage = gym.media?.mapPreviewImage ?? gym.image;
  const heroImages = gym.images;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <GymHero
          images={heroImages}
          slideshowActive={isFocused}
          gymName={gym.name}
          onBack={() => navigation.goBack()}
          onFavorite={onFavorite}
          onShare={() => {
            void onShare();
          }}
        />

        <View style={s.body}>
          <View style={s.titleRow}>
            <Text style={s.title}>{gym.name}</Text>
            <TrafficBadge trafficLevel={gym.traffic} />
          </View>

          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <MaterialCommunityIcons name="star" size={16} color={C.primary} />
              <Text style={s.metaValue}>{gym.rating.toFixed(1)}</Text>
              <Text style={s.metaMuted}>({gym.reviews} reviews)</Text>
            </View>
            <View style={s.metaItem}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={C.primary} />
              <Text style={s.metaMuted}>{gym.address}</Text>
            </View>
          </View>

          <EnrollButton onPress={onEnroll} />

          <AboutSection about={gym.about} />

          <OffersList offers={offers} />

          <MapPreview gymName={gym.name} address={gym.address} mapImageUrl={mapPreviewImage} onOpenInMaps={onOpenMaps} />

          <TouchableOpacity style={s.checkInBtn} onPress={() => openCheckInOrSession(gym.id)}>
            <MaterialCommunityIcons name="qrcode-scan" size={18} color="#fff" />
            <Text style={s.checkInText}>Quick Check In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SocialLinksExpander links={gym.social ?? {}} />
      <MapPickerSheet
        visible={mapPickerVisible}
        availableOptions={mapPickerOptions}
        onSelect={(preference, rememberChoice) => {
          void onSelectMapPreference(preference, rememberChoice);
        }}
        onClose={onCloseMapPicker}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 120 },
  body: {
    marginTop: -16,
    backgroundColor: C.bg,
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    paddingHorizontal: S.md,
    paddingTop: S.md,
    gap: S.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: F.x3,
    fontWeight: '900',
    color: '#fff',
  },
  metaRow: {
    gap: S.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaValue: {
    color: '#fff',
    fontSize: F.sm,
    fontWeight: '800',
  },
  metaMuted: {
    color: C.muted,
    fontSize: F.sm,
    fontWeight: '600',
    flexShrink: 1,
  },
  checkInBtn: {
    height: 46,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  checkInText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: F.sm,
  },
  notFound: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: C.muted, fontSize: F.base },
});
