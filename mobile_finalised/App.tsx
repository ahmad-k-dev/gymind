import 'react-native-reanimated';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useUI } from './src/store/ui';

export default function App() {
  const themeMode = useUI((s) => s.themeMode);

  return (
    <SafeAreaProvider>
      <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
