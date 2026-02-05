import type React from 'react';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import SpaceMono from '@/assets/fonts/SpaceMono-Regular.ttf';
import { UpdateBanner, UpdatesProvider } from '@/features/updates';
import { useColorScheme } from '@/hooks/useColorScheme';

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
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <UpdateBanner />
        <Stack>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
          <Stack.Screen name='+not-found' />
        </Stack>
        <StatusBar style='auto' />
      </ThemeProvider>
    </UpdatesProvider>
  );
};

let AppEntryPoint = RootLayout;

if (Constants.expoConfig?.extra?.appEnv === 'storybook' || Boolean(Constants.expoConfig?.extra?.enabledStorybook)) {
  AppEntryPoint = require('../../tests/storybook/.rnstorybook').default;
}

export default AppEntryPoint;
