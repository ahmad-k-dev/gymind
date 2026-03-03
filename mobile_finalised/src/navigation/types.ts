import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStack = {
  Boot: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: NavigatorScreenParams<TabStack> | undefined;
  AiChat: undefined;
  ProfileModal: NavigatorScreenParams<ProfileStack> | undefined;
};
export type AuthStack = {
  Login: undefined; 
  Register: undefined; 
  Forgot: undefined;
};
export type HomeStack = {
  Home: undefined;
  GymProfile: { gymId: string };
  CheckIn: { gymId: string };
  Session: { gymId: string; sessionId?: string };
};
export type TabStack = {
  HomeTab: NavigatorScreenParams<HomeStack> | undefined;
  LocationTab: undefined;
  CenterTab: undefined;
  AITab: undefined;
  StatsTab: undefined;
};
export type ProfileStack = {
  Profile: undefined; 
  EditProfile: undefined; 
  Settings: undefined;
};
