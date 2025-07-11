import { FlatCompat } from '@eslint/eslintrc';
import tseslint, { type ConfigArray } from 'typescript-eslint';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const expoConfig = require('eslint-config-expo/flat');
const compat = new FlatCompat({});

export const reactNativeConfig: ConfigArray = tseslint.config(
  ...compat.extends('plugin:react-native/all'),
  ...compat.plugins('eslint-plugin-react-native'),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  expoConfig,
  {
    settings: {
      'import/ignore': [
        'react-native',
        '@react-native',
        '@react-native-community',
        'node_modules/react-native',
        '\\.native$',
        'expo',
        'expo-.*',
      ],
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.native.js', '.android.js', '.ios.js'],
        },
      },
      'import/core-modules': ['react-native'],
    },
    rules: {
      'react-native/no-raw-text': 'off', // Because this rule does not work with flat config yet,
      'import/no-unresolved': ['error', { ignore: ['react-native'] }],
    },
  },
  {
    files: ['**/stories/**/*.ts', '**/stories/**/*.tsx', '**/*.stories.ts', '**/*.stories.tsx'],
    rules: {
      'react-native/no-inline-styles': 'off',
    },
  },
);
