import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import { C, F, R, S } from '../../../theme';

interface MapPreviewProps {
  gymName: string;
  address: string;
  mapImageUrl: string;
  onOpenInMaps: () => void;
}

export const MapPreview = React.memo(function MapPreview({
  gymName,
  address,
  mapImageUrl,
  onOpenInMaps,
}: MapPreviewProps) {
  return (
    <View style={s.wrap}>
      <Text style={s.title}>Location</Text>
      <Text style={s.address}>{address}</Text>
      <TouchableOpacity style={s.mapCard} onPress={onOpenInMaps} activeOpacity={0.9}>
        <Image source={{ uri: mapImageUrl }} style={s.mapImage} resizeMode="cover" />
        <View style={s.mapOverlay} />
        <View style={s.markerWrap}>
          <MaterialCommunityIcons name="map-marker" size={30} color={C.primary} />
          <View style={s.markerLabel}>
            <Text style={s.markerLabelTxt} numberOfLines={1}>
              {gymName}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={s.link} onPress={onOpenInMaps} activeOpacity={0.8}>
        <Text style={s.linkText}>Open in Maps</Text>
      </TouchableOpacity>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { gap: S.sm },
  title: {
    fontSize: F.xl,
    fontWeight: '800',
    color: '#fff',
  },
  address: {
    fontSize: F.sm,
    color: C.muted,
    lineHeight: 18,
  },
  mapCard: {
    height: 170,
    borderRadius: R.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  mapImage: { ...StyleSheet.absoluteFillObject, opacity: 0.8 },
  mapOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  markerWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerLabel: {
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: R.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: '70%',
  },
  markerLabelTxt: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  link: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  linkText: {
    color: C.primary,
    fontSize: F.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
