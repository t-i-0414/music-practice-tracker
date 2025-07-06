import { pluginBackend } from '@music-practice-tracker/eslint-rules';
import vitestPlugin from '@vitest/eslint-plugin';
import prettierConfig from 'eslint-config-prettier/flat';
import jestPlugin from 'eslint-plugin-jest';
import globals from 'globals';
import tseslint, { type ConfigArray } from 'typescript-eslint';

import { createBaseConfig, testFilePatterns } from './base.config';

const enabledBackendPluginRules = Object.keys(pluginBackend.rules).reduce<Record<string, 'error'>>((acc, rule) => {
  acc[`custom-backend-eslint/${rule}`] = 'error';
  return acc;
}, {});

const disabledBackendPluginRules = Object.keys(pluginBackend.rules).reduce<Record<string, 'off'>>((acc, rule) => {
  acc[`custom-backend-eslint/${rule}`] = 'off';
  return acc;
}, {});

const disabledVitestRules = Object.keys(vitestPlugin.rules).reduce<Record<string, 'off'>>((acc, rule) => {
  acc[`vitest/${rule}`] = 'off';
  return acc;
}, {});

export const createBackendConfig = ({ includesTsEslintPlugin = true, includeImportPlugin = true } = {}): ConfigArray =>
  tseslint.config(
    {
      extends: [createBaseConfig({ includesTsEslintPlugin, includeImportPlugin })],
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
        sourceType: 'commonjs',
      },
      plugins: {
        'custom-backend-eslint': pluginBackend,
      },
      rules: enabledBackendPluginRules,
    },
    {
      files: testFilePatterns,
      plugins: {
        vitest: vitestPlugin,
      },
      ...jestPlugin.configs['flat/all'],
      rules: {
        ...disabledVitestRules,
        ...disabledBackendPluginRules,
      },
    },
    prettierConfig,
  );

export default createBackendConfig();
