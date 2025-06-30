import { Tabs } from 'expo-router';
import type React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { type BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useCallback } from 'react';

const TabLayout: React.FC = () => {
  const colorScheme = useColorScheme();
  const renderHapticTab = useCallback((props: BottomTabBarButtonProps) => <HapticTab {...props} />, []);
  const renderHouseIcon = useCallback(
    ({ color }: { color: string }) => <IconSymbol size={28} name='house.fill' color={color} />,
    [],
  );
  const renderHouseIconWithColorScheme = useCallback(
    ({ color }: { color: string }) => <IconSymbol size={28} name='paperplane.fill' color={color} />,
    [],
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
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
        }}
      />
    </Tabs>
  );
};
export default TabLayout;
