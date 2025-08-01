import type React from 'react';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import SpaceMono from '@/assets/fonts/SpaceMono-Regular.ttf';
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen name='+not-found' />
      </Stack>
      <StatusBar style='auto' />
    </ThemeProvider>
  );
};

let AppEntryPoint = RootLayout;

if (process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true') {
  AppEntryPoint = require('../../tests/storybook/.rnstorybook').default;
}

export default AppEntryPoint;
