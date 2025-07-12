import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import tseslint, { type ConfigArray } from 'typescript-eslint';

import { baseConfig } from './eslint-config-base';
import { importConfig } from './eslint-config-import';
import { tsConfig } from './eslint-config-typescript';

export const baseScriptConfigRules: FlatConfig.Rules = {
  'no-console': 'off',
  'no-undef': 'off',

  '@typescript-eslint/no-magic-numbers': 'off',
};

export const baseScriptConfig: ConfigArray = tseslint.config(baseConfig, tsConfig, importConfig, {
  rules: baseScriptConfigRules,
});
