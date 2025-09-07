import type { Linter } from 'eslint';
import { defineConfig } from 'eslint/config';

import { baseConfig } from './eslint-config-base';
import { importConfig } from './eslint-config-import';
import { tsConfig } from './eslint-config-typescript';

export const baseScriptConfigRules: Linter.RulesRecord = {
  'no-console': 'off',
  'no-undef': 'off',

  '@typescript-eslint/no-magic-numbers': 'off',
};

export const baseScriptConfig = defineConfig(baseConfig, tsConfig, importConfig, {
  rules: baseScriptConfigRules,
});
