import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/auth';
import { useUI } from '../store/ui';
import { useAnnouncement } from '../features/announcement/announcementSlice';
import type { RootStack } from './types';
import { BootScreen } from '../screens/Boot/BootScreen';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { AuthNavigator } from './AuthNavigator';
import { BottomTabs } from './BottomTabs';
import { ProfileNavigator } from './ProfileNavigator';
import { useThemeColors } from '../theme';
import { useActiveSession } from '../features/session/sessionSlice';
import { useNotifications } from '../features/notifications/notificationsSlice';
import { AIScreen } from '../screens/AIAssistant/AIScreen';

const Stack = createNativeStackNavigator<RootStack>();

export function RootNavigator() {
  const [ready, setReady] = useState(false);
  const { authed, init } = useAuth();
  const { onboarded, loadOnboarded, loadPreferences } = useUI();
  const loadAnnouncement = useAnnouncement(s => s.loadAnnouncement);
  const hydrateActiveSession = useActiveSession((state) => state.hydrateActiveSession);
  const hydrateNotifications = useNotifications((state) => state.hydrateNotifications);
  const TC = useThemeColors();
  const opts = { headerShown: false, contentStyle: { backgroundColor: TC.bg } };

  useEffect(() => {
    (async () => {
      await init();
      await Promise.allSettled([
        loadOnboarded(),
        loadPreferences(),
        loadAnnouncement(),
        hydrateActiveSession(),
        hydrateNotifications(),
      ]);
      setReady(true);
    })();
  }, [hydrateActiveSession, hydrateNotifications, init, loadAnnouncement, loadOnboarded, loadPreferences]);

  if (!ready) return <BootScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator id="RootStack" screenOptions={opts}>
        {!onboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !authed ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={BottomTabs} />
            <Stack.Screen name="AiChat" component={AIScreen} />
            <Stack.Screen name="ProfileModal" component={ProfileNavigator} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
