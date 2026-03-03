import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useGyms } from '../../store/gyms';
import { C, F, R, S, useThemeColors } from '../../theme';
import type { TabStack } from '../../navigation/types';
import type { Gym } from '../../types';
import { haversineDistanceKm, type Coordinates } from '../../utils/distance';
import { DistanceChips, type DistanceBucket } from './components/DistanceChips';
import { RadarPulse } from './components/RadarPulse';

type TabNav = BottomTabNavigationProp<TabStack, 'LocationTab'>;
type PermissionState = 'loading' | 'granted' | 'denied';

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface MapViewProps {
  style?: StyleProp<ViewStyle>;
  initialRegion: Region;
  showsUserLocation?: boolean;
  children?: React.ReactNode;
}

interface MarkerProps {
  coordinate: Coordinates;
  onPress?: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

interface MapsModule {
  default: React.ComponentType<MapViewProps>;
  Marker: React.ComponentType<MarkerProps>;
}

interface GymWithDistance {
  gym: Gym;
  distanceKm: number;
}

function inBucket(distanceKm: number, bucket: DistanceBucket): boolean {
  if (bucket === '0-3') return distanceKm <= 3;
  if (bucket === '3-6') return distanceKm > 3 && distanceKm <= 6;
  return distanceKm > 6 && distanceKm <= 10;
}

const GymMarker = React.memo(function GymMarker({
  MarkerComponent,
  gym,
  onPress,
}: {
  MarkerComponent: React.ComponentType<MarkerProps>;
  gym: GymWithDistance;
  onPress: (id: string) => void;
}) {
  if (!gym.gym.coords) return null;
  return (
    <MarkerComponent
      coordinate={gym.gym.coords}
      onPress={() => onPress(gym.gym.id)}
      title={gym.gym.name}
      description={`${gym.distanceKm.toFixed(1)} km away`}
    >
      <View style={s.pinWrap}>
        <MaterialCommunityIcons name="map-marker" size={22} color="#FD6A08" />
      </View>
    </MarkerComponent>
  );
});

export function LocationScreen() {
  const TC = useThemeColors();
  const navigation = useNavigation<TabNav>();
  const gyms = useGyms((state) => state.gyms);
  const fetchGyms = useGyms((state) => state.fetchGyms);

  const [permission, setPermission] = React.useState<PermissionState>('loading');
  const [bucket, setBucket] = React.useState<DistanceBucket>('0-3');
  const [userCoords, setUserCoords] = React.useState<Coordinates | null>(null);
  const [locating, setLocating] = React.useState(false);
  const mapsModuleRef = React.useRef<MapsModule | null>(null);

  if (mapsModuleRef.current === null) {
    try {
      mapsModuleRef.current = require('react-native-maps') as MapsModule;
    } catch {
      mapsModuleRef.current = null;
    }
  }

  const MapViewComponent = mapsModuleRef.current?.default ?? null;
  const MarkerComponent = mapsModuleRef.current?.Marker ?? null;

  React.useEffect(() => {
    if (gyms.length === 0) {
      void fetchGyms();
    }
  }, [fetchGyms, gyms.length]);

  const requestLocation = React.useCallback(async () => {
    setLocating(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setPermission('denied');
      setLocating(false);
      return;
    }

    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    setUserCoords({
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    });
    setPermission('granted');
    setLocating(false);
  }, []);

  React.useEffect(() => {
    void requestLocation();
  }, [requestLocation]);

  const mapRegion = React.useMemo<Region | null>(() => {
    if (!userCoords) return null;
    return {
      latitude: userCoords.latitude,
      longitude: userCoords.longitude,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    };
  }, [userCoords]);

  const gymsInRange = React.useMemo<GymWithDistance[]>(() => {
    if (!userCoords) return [];

    return gyms
      .filter((gym) => gym.coords)
      .map((gym) => ({
        gym,
        distanceKm: haversineDistanceKm(userCoords, gym.coords as Coordinates),
      }))
      .filter((item) => inBucket(item.distanceKm, bucket));
  }, [bucket, gyms, userCoords]);

  const onOpenGym = React.useCallback(
    (gymId: string) => {
      navigation.navigate('HomeTab', {
        screen: 'GymProfile',
        params: { gymId },
      });
    },
    [navigation]
  );

  if (permission === 'denied') {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]} edges={['top']}>
        <View style={s.centerState}>
          <MaterialCommunityIcons name="map-marker-off-outline" size={36} color={TC.primary} />
          <Text style={[s.stateTitle, { color: TC.text }]}>Location Permission Needed</Text>
          <Text style={[s.stateSub, { color: TC.muted }]}>
            Enable location permission to discover nearby gyms.
          </Text>
          <TouchableOpacity style={[s.retryBtn, { backgroundColor: TC.primary }]} onPress={() => void requestLocation()}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!mapRegion || locating || permission === 'loading') {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]} edges={['top']}>
        <View style={s.centerState}>
          <ActivityIndicator color={TC.primary} />
          <Text style={[s.stateSub, { color: TC.muted }]}>Locating nearby gyms...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!MapViewComponent || !MarkerComponent) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]} edges={['top']}>
        <View style={s.centerState}>
          <MaterialCommunityIcons name="map-marker-off-outline" size={36} color={TC.primary} />
          <Text style={[s.stateTitle, { color: TC.text }]}>Map Module Not Available</Text>
          <Text style={[s.stateSub, { color: TC.muted }]}>
            Install Expo-compatible maps and restart the app runtime.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: TC.bg }]} edges={['top']}>
      <MapViewComponent style={StyleSheet.absoluteFill} initialRegion={mapRegion} showsUserLocation={false}>
        <MarkerComponent coordinate={userCoords}>
          <RadarPulse color={TC.primary} />
        </MarkerComponent>
        {gymsInRange.map((item) => (
          <GymMarker key={item.gym.id} MarkerComponent={MarkerComponent} gym={item} onPress={onOpenGym} />
        ))}
      </MapViewComponent>

      <View style={[s.overlayTop, { backgroundColor: `${TC.bg}D9`, borderColor: TC.border }]}>
        <View style={s.rowBetween}>
          <Text style={[s.heading, { color: TC.text }]}>Location Discovery</Text>
          <TouchableOpacity onPress={() => void requestLocation()}>
            <MaterialCommunityIcons name="crosshairs-gps" size={20} color={TC.primary} />
          </TouchableOpacity>
        </View>
        <DistanceChips selected={bucket} onSelect={setBucket} />
        <Text style={[s.countText, { color: TC.muted }]}>
          {gymsInRange.length} gyms in selected range
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  overlayTop: {
    marginHorizontal: S.lg,
    marginTop: S.md,
    borderRadius: R.lg,
    borderWidth: 1,
    padding: S.md,
    gap: S.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: F.lg,
    fontWeight: '900',
  },
  countText: {
    fontSize: F.xs,
    fontWeight: '700',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: S.lg,
    gap: S.md,
  },
  stateTitle: {
    fontSize: F.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  stateSub: {
    fontSize: F.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: S.sm,
    height: 44,
    borderRadius: R.md,
    paddingHorizontal: S.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: F.sm,
  },
  pinWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
