import React from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { C, R, S } from '../../../theme';
import type { GymSocialLinks } from '../../../types';

type SocialKey = 'instagram' | 'facebook' | 'whatsapp' | 'website';
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface SocialItem {
  key: SocialKey;
  url: string;
  icon: IconName;
}

interface SocialLinksExpanderProps {
  links: GymSocialLinks;
}

function buildSocialItems(links: GymSocialLinks): SocialItem[] {
  const items: SocialItem[] = [];
  if (links.instagram) items.push({ key: 'instagram', url: links.instagram, icon: 'instagram' });
  if (links.facebook) items.push({ key: 'facebook', url: links.facebook, icon: 'facebook' });
  if (links.whatsapp) items.push({ key: 'whatsapp', url: links.whatsapp, icon: 'whatsapp' });
  if (links.website) items.push({ key: 'website', url: links.website, icon: 'web' });
  return items;
}

export const SocialLinksExpander = React.memo(function SocialLinksExpander({ links }: SocialLinksExpanderProps) {
  const expanded = useSharedValue(0);
  const items = React.useMemo(() => buildSocialItems(links), [links]);
  const slots = [useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0)];

  if (items.length === 0) return null;

  const toggle = React.useCallback(() => {
    const next = expanded.value === 0 ? 1 : 0;
    expanded.value = next;
    slots.forEach((slot, index) => {
      slot.value = next === 1 ? withDelay(index * 60, withTiming(1, { duration: 180 })) : withTiming(0, { duration: 140 });
    });
  }, [expanded, slots]);

  const openUrl = React.useCallback(async (url: string) => {
    const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const canOpen = await Linking.canOpenURL(normalizedUrl);
    if (canOpen) {
      await Linking.openURL(normalizedUrl);
    }
  }, []);

  return (
    <View style={s.wrap}>
      {items.map((item, index) => (
        <SocialBubble
          key={item.key}
          icon={item.icon}
          progress={slots[index]}
          onPress={() => {
            void openUrl(item.url);
          }}
        />
      ))}
      <TouchableOpacity style={s.primaryButton} onPress={toggle} activeOpacity={0.9}>
        <MaterialCommunityIcons name="share-variant" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
});

const SocialBubble = React.memo(function SocialBubble({
  icon,
  progress,
  onPress,
}: {
  icon: IconName;
  progress: SharedValue<number>;
  onPress: () => void;
}) {
  const animStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    marginTop: (1 - progress.value) * 12,
    height: progress.value * 40,
    marginBottom: progress.value > 0 ? 10 : 0,
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity style={s.secondaryButton} onPress={onPress} activeOpacity={0.85}>
        <MaterialCommunityIcons name={icon} size={20} color={C.primary} />
      </TouchableOpacity>
    </Animated.View>
  );
});

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: S.md,
    bottom: 100,
    alignItems: 'center',
  },
  primaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  secondaryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.primary + '44',
  },
});
