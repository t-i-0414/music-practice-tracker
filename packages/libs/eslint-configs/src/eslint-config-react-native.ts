import { FlatCompat } from '@eslint/eslintrc';
import type { Linter } from 'eslint';
import { defineConfig } from 'eslint/config';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const expoConfig: Linter.Config = require('eslint-config-expo/flat');
const compat = new FlatCompat({});

export const reactNativeConfig = defineConfig(
  ...compat.extends('plugin:react-native/all'),
  ...compat.plugins('eslint-plugin-react-native'),

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
