import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStack } from './types';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { GymProfileScreen } from '../screens/GymProfile/GymProfileScreen';
import { CheckInScreen } from '../screens/CheckIn/CheckInScreen';
import { SessionScreen } from '../screens/ActiveSession/SessionScreen';
import { NotificationsScreen } from '../screens/Profile/NotificationsScreen';

const Stack = createNativeStackNavigator<HomeStack>();

export function HomeNavigator() {
  return (
    <Stack.Navigator id="HomeStack" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A' } }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="GymProfile" component={GymProfileScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
      <Stack.Screen name="Session" component={SessionScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
