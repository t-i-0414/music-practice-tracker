import type React from 'react';
import { useEffect } from 'react';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import SpaceMono from '@/assets/fonts/SpaceMono-Regular.ttf';
import { AuthProvider, useAuthContext } from '@/features/auth';
import { UpdateBanner, UpdatesProvider } from '@/features/updates';
import { useColorScheme } from '@/hooks/useColorScheme';

void SplashScreen.preventAutoHideAsync();

const RootNavigator: React.FC = () => {
  const { authState } = useAuthContext();

  useEffect(() => {
    if (authState.status !== 'initializing') {
      void SplashScreen.hideAsync();
    }
  }, [authState.status]);

  if (authState.status === 'initializing') {
    return null;
  }

  return (
    <>
      <UpdateBanner />
      <Stack>
        <Stack.Screen name='(auth)' options={{ headerShown: false }} />
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen name='+not-found' />
      </Stack>
      <StatusBar style='auto' />
    </>
  );
};

const RootLayout: React.FC = () => {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono,
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <UpdatesProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootNavigator />
        </ThemeProvider>
      </AuthProvider>
    </UpdatesProvider>
  );
};

let AppEntryPoint = RootLayout;

if (Constants.expoConfig?.extra?.appEnv === 'storybook' || Boolean(Constants.expoConfig?.extra?.enabledStorybook)) {
  AppEntryPoint = require('../../tests/storybook/.rnstorybook').default;
}

export default AppEntryPoint;
