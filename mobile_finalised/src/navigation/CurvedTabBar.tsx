import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import MaterialCommunityIcons from 'expo/node_modules/@expo/vector-icons/MaterialCommunityIcons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useThemeColors } from '../theme';
import { selectIsSessionActive, useActiveSession } from '../features/session/sessionSlice';
import type { TabStack } from './types';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const LOGO_SOURCE = require('../assets/images/GYMIN-LOGO.png');
const TAB_HEIGHT = 72;
const CENTER_SIZE = 72;
const CENTER_LIFT = 18;

interface TabVisual {
  icon: IconName;
  label: string;
}

const TAB_VISUALS: Record<'HomeTab' | 'LocationTab' | 'AITab' | 'StatsTab', TabVisual> = {
  HomeTab: { icon: 'home-outline', label: 'Home' },
  LocationTab: { icon: 'map-marker-radius-outline', label: 'Location' },
  AITab: { icon: 'robot-outline', label: 'AI' },
  StatsTab: { icon: 'account-circle-outline', label: 'Profile' },
};

const TabItem = React.memo(function TabItem({
  icon,
  label,
  focused,
  onPress,
}: {
  icon: IconName;
  label: string;
  focused: boolean;
  onPress: () => void;
}) {
  const TC = useThemeColors();
  const color = focused ? TC.primary : TC.muted;

  return (
    <TouchableOpacity style={s.item} onPress={onPress} activeOpacity={0.8}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
      <Text style={[s.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
});

export const CurvedTabBar = React.memo(function CurvedTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const TC = useThemeColors();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSessionActive = useActiveSession(selectIsSessionActive);
  const activeGymId = useActiveSession((session) => session.gymId);
  const activeSessionId = useActiveSession((session) => session.sessionId);

  const pressScale = useSharedValue(1);
  const animatedCenter = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const barHeight = TAB_HEIGHT + Math.max(insets.bottom - 6, 0);
  const notchWidth = 136;
  const notchDepth = 34;
  const centerX = width / 2;

  const notchPath = `M0 0 H${centerX - notchWidth / 2}
    C${centerX - 52} 0 ${centerX - 44} ${notchDepth} ${centerX} ${notchDepth}
    C${centerX + 44} ${notchDepth} ${centerX + 52} 0 ${centerX + notchWidth / 2} 0
    H${width} V${barHeight} H0 Z`;

  const pressTab = React.useCallback(
    (routeKey: string, routeName: string, isFocused: boolean) => {
      const event = navigation.emit({
        type: 'tabPress',
        target: routeKey,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName as never);
      }
    },
    [navigation]
  );

  const onCenterPress = React.useCallback(() => {
    if (isSessionActive) {
      navigation.navigate('HomeTab', {
        screen: 'Session',
        params: { gymId: activeGymId ?? '1', sessionId: activeSessionId ?? undefined },
      } as never);
      return;
    }

    navigation.navigate('HomeTab', {
      screen: 'CheckIn',
      params: { gymId: activeGymId ?? '1' },
    } as never);
  }, [activeGymId, activeSessionId, isSessionActive, navigation]);

  const animateDown = React.useCallback(() => {
    pressScale.value = withSpring(0.92, { damping: 16, stiffness: 220 });
  }, [pressScale]);

  const animateUp = React.useCallback(() => {
    pressScale.value = withSpring(1, { damping: 14, stiffness: 180 });
  }, [pressScale]);

  const renderSideTabs = (routeNames: readonly (keyof typeof TAB_VISUALS)[]) =>
    routeNames.map((name) => {
      const route = state.routes.find((item) => item.name === name);
      if (!route) return null;
      const options = descriptors[route.key]?.options;
      const focused = state.routes[state.index]?.name === name;
      const visual = TAB_VISUALS[name];
      return (
        <TabItem
          key={name}
          icon={visual.icon}
          label={visual.label}
          focused={focused}
          onPress={() => {
            if (options?.tabBarButton) return;
            pressTab(route.key, route.name, focused);
          }}
        />
      );
    });

  return (
    <View style={[s.wrap, { height: barHeight }]} pointerEvents="box-none">
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={width} height={barHeight} style={StyleSheet.absoluteFill}>
          <Path d={notchPath} fill={TC.surface} stroke={TC.border} strokeWidth={1} />
        </Svg>
      </View>

      <View style={s.row} pointerEvents="box-none">
        <View style={s.side}>{renderSideTabs(['HomeTab', 'LocationTab'])}</View>
        <View style={s.gap} />
        <View style={s.side}>{renderSideTabs(['AITab', 'StatsTab'])}</View>
      </View>

      <Animated.View style={[s.centerWrap, animatedCenter]} pointerEvents="box-none">
        <TouchableOpacity
          style={[
            s.centerBtn,
            {
              backgroundColor: TC.surface2,
              borderColor: `${TC.primary}55`,
              shadowColor: Platform.OS === 'ios' ? '#000' : TC.primary,
            },
          ]}
          onPress={onCenterPress}
          onPressIn={animateDown}
          onPressOut={animateUp}
          activeOpacity={0.95}
        >
          <Image source={LOGO_SOURCE} style={s.centerLogo} resizeMode="contain" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 10,
    paddingHorizontal: 10,
    zIndex: 21,
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gap: {
    width: CENTER_SIZE + 16,
  },
  item: {
    width: 64,
    alignItems: 'center',
    gap: 2,
    zIndex: 22,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  centerWrap: {
    position: 'absolute',
    top: -CENTER_LIFT,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 24,
  },
  centerBtn: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    elevation: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  centerLogo: {
    width: '100%',
    height: '100%',
  },
});
