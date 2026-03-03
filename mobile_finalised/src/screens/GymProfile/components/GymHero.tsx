import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import { C, F, R, S } from '../../../theme';
import { GymImageSlideshow } from './GymImageSlideshow';

interface GymHeroProps {
  images: readonly string[];
  slideshowActive: boolean;
  gymName: string;
  onBack: () => void;
  onFavorite: () => void;
  onShare: () => void;
}

export const GymHero = React.memo(function GymHero({
  images,
  slideshowActive,
  gymName,
  onBack,
  onFavorite,
  onShare,
}: GymHeroProps) {
  return (
    <View style={s.hero}>
      <GymImageSlideshow images={images} isActive={slideshowActive} />
      <View style={s.overlay} />
      <View style={s.header}>
        <TouchableOpacity style={s.iconButton} onPress={onBack} activeOpacity={0.85}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={s.rightActions}>
          <TouchableOpacity style={s.iconButton} onPress={onFavorite} activeOpacity={0.85}>
            <MaterialCommunityIcons name="heart-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconButton} onPress={onShare} activeOpacity={0.85}>
            <MaterialCommunityIcons name="share-variant-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={s.bottomLabel}>
        <Text style={s.bottomLabelText} numberOfLines={1}>
          {gymName}
        </Text>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  hero: {
    height: 320,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: C.surface,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  header: {
    position: 'absolute',
    top: S.md,
    left: S.md,
    right: S.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightActions: {
    flexDirection: 'row',
    gap: S.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bottomLabel: {
    position: 'absolute',
    bottom: 14,
    left: S.md,
    right: S.md,
  },
  bottomLabelText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: F.sm,
    fontWeight: '700',
  },
});
