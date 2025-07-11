import type React from 'react';

import { type StyleProp, type ViewStyle } from 'react-native';

import { SymbolView, type SymbolViewProps, type SymbolWeight } from 'expo-symbols';

import { DEFAULT_ICON_SIZE } from '@/constants/Size';

export const IconSymbol: React.FC<{
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}> = ({ name, size = DEFAULT_ICON_SIZE, color, style, weight = 'regular' }) => (
  <SymbolView
    weight={weight}
    tintColor={color}
    resizeMode='scaleAspectFit'
    name={name}
    style={[
      {
        width: size,
        height: size,
      },
      style,
    ]}
  />
);
