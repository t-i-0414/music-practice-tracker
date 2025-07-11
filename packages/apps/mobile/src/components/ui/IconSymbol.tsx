// Fallback for using MaterialIcons on Android and web.

import type React from 'react';
import { type ComponentProps } from 'react';

import { type OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { type SymbolViewProps, type SymbolWeight } from 'expo-symbols';

import { DEFAULT_ICON_SIZE } from '@/constants/Size';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: Partial<IconMapping> = {
  'house.fill': 'home',
  // cspell:ignore paperplane
  'paperplane.fill': 'send',
  // cspell:ignore forwardslash
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export const IconSymbol: React.FC<{
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}> = ({ name, size = DEFAULT_ICON_SIZE, color, style }) => (
  <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />
);
