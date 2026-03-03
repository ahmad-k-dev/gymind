import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeNavigator } from './HomeNavigator';
import { CurvedTabBar } from './CurvedTabBar';
import { AIScreen } from '../screens/AIAssistant/AIScreen';
import { StatsScreen } from '../screens/Stats/StatsScreen';
import type { TabStack } from './types';
import { useThemeColors } from '../theme';

const Tab = createBottomTabNavigator<TabStack>();

const EmptyCenterScreen = React.memo(function EmptyCenterScreen() {
  return null;
});

export function BottomTabs() {
  const insets = useSafeAreaInsets();
  const TC = useThemeColors();
  const tabGap = 28 + insets.bottom;

  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        lazy: true,
        tabBarStyle: { position: 'absolute', height: 0 },
        sceneStyle: { paddingBottom: tabGap, backgroundColor: TC.bg },
      }}
      tabBar={(props) => <CurvedTabBar {...props} />}
    >
      <Tab.Screen name="HomeTab" component={HomeNavigator} />
      <Tab.Screen
        name="LocationTab"
        getComponent={() => require('../screens/Location/LocationScreen').LocationScreen}
      />
      <Tab.Screen name="CenterTab" component={EmptyCenterScreen} />
      <Tab.Screen name="AITab" component={AIScreen} />
      <Tab.Screen name="StatsTab" component={StatsScreen} />
    </Tab.Navigator>
  );
}
