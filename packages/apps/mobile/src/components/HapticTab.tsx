import type React from 'react';

import { type BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export const HapticTab: React.FC<BottomTabBarButtonProps> = (props) => (
  <PlatformPressable
    {...props}
    onPressIn={(ev) => {
      if (process.env.EXPO_OS === 'ios') {
        // Add a soft haptic feedback when pressing down on the tabs.
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      props.onPressIn?.(ev);
    }}
  />
);
