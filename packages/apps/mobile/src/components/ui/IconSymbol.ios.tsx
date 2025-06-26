import { DEFAULT_ICON_SIZE } from '@/constants/Size';
import { SymbolView, type SymbolViewProps, type SymbolWeight } from 'expo-symbols';
import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

export function IconSymbol({
  name,
  size = DEFAULT_ICON_SIZE,
  color,
  style,
  weight = 'regular',
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}): React.JSX.Element {
  return (
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
}
