import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStack } from './types';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { ForgotScreen } from '../screens/Auth/ForgotScreen';

const Stack = createNativeStackNavigator<AuthStack>();

export function AuthNavigator() {
  return (
    <Stack.Navigator id="AuthStack" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A' } }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Forgot" component={ForgotScreen} />
    </Stack.Navigator>
  );
}
