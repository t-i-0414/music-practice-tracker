import { pluginBackend } from '@music-practice-tracker/eslint-rules';
import vitestPlugin from '@vitest/eslint-plugin';
import prettierConfig from 'eslint-config-prettier/flat';
import jestPlugin from 'eslint-plugin-jest';
import globals from 'globals';
import tseslint, { type ConfigArray } from 'typescript-eslint';

import { createBaseConfig, testFilePatterns } from './base.config';

const vitestRules = Object.keys(vitestPlugin.rules).reduce<Record<string, 'off'>>((acc, rule) => {
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
      rules: {
        'custom-backend-eslint/prisma-find-naming-convention': 'error',
        'custom-backend-eslint/prisma-update-naming-convention': 'error',
        'custom-backend-eslint/prisma-create-no-deleted-at': 'error',
        'custom-backend-eslint/prisma-create-naming-convention': 'error',
        'custom-backend-eslint/prisma-delete-naming-convention': 'error',
        'custom-backend-eslint/prisma-repository-only-access': 'error',
        'custom-backend-eslint/repository-model-access-restriction': 'error',
      },
    },
    {
      files: testFilePatterns,
      plugins: {
        vitest: vitestPlugin,
      },
      ...jestPlugin.configs['flat/all'],
      rules: vitestRules,
    },
    prettierConfig,
  );

export default createBackendConfig();
