import type React from 'react';
import { useCallback } from 'react';

import { Platform } from 'react-native';

import { type BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Redirect, Tabs } from 'expo-router';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuthContext } from '@/features/auth';
import { useColorScheme } from '@/hooks/useColorScheme';

const TabLayout: React.FC = () => {
  const colorScheme = useColorScheme();
  const { authState } = useAuthContext();
  const renderHapticTab = useCallback((props: BottomTabBarButtonProps) => <HapticTab {...props} />, []);
  const renderHouseIcon = useCallback(
    ({ color }: { color: string }) => <IconSymbol size={28} name='house.fill' color={color} />,
    [],
  );
  const renderHouseIconWithColorScheme = useCallback(
    ({ color }: { color: string }) => <IconSymbol size={28} name='paperplane.fill' color={color} />,
    [],
  );

  if (authState.status === 'initializing') {
    return null;
  }

  if (authState.status !== 'authenticated') {
    return <Redirect href='/sign-up' />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].primary,
        headerShown: false,
        tabBarButton: renderHapticTab,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: renderHouseIcon,
        }}
      />
      <Tabs.Screen
        name='explore'
        options={{
          title: 'Explore',
          // cspell:ignore paperplane
          tabBarIcon: renderHouseIconWithColorScheme,
          tabBarAccessibilityLabel: 'nav-explore',
        }}
      />
    </Tabs>
  );
};
export default TabLayout;
