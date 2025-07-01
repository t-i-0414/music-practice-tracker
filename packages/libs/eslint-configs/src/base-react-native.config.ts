import { FlatCompat } from '@eslint/eslintrc';
import prettierConfig from 'eslint-config-prettier';
import tseslint, { type ConfigArray } from 'typescript-eslint';

import { createBaseReactConfig } from './base-react.config';

const compat = new FlatCompat({});

export const createBaseReactNativeConfig = ({
  includesTsEslintPlugin = true,
  includeImportPlugin = true,
  includeReactHooks = true,
} = {}): ConfigArray =>
  tseslint.config(
    ...compat.extends('plugin:react-native/all'),
    ...compat.plugins('eslint-plugin-react-native'),
    {
      extends: [createBaseReactConfig({ includesTsEslintPlugin, includeImportPlugin, includeReactHooks })],
      rules: {
        'react-native/no-raw-text': 'off',
      },
    },
    prettierConfig,
  );

export default createBaseReactNativeConfig({
  includesTsEslintPlugin: false,
  includeImportPlugin: false,
  includeReactHooks: false,
});
