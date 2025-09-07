import {
  baseConfig,
  tsConfig,
  sharedIgnores,
  vitestConfig,
  testFilePatterns,
  importConfig,
} from '@music-practice-tracker/eslint-configs';
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import { globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

const config: FlatConfig.ConfigArray = tseslint.config(
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.ts'],
    extends: [baseConfig, tsConfig, importConfig],
    rules: {
      'no-warning-comments': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-deprecated': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
    },
  },
  {
    files: testFilePatterns({ prefix: 'tests' }),
    extends: [vitestConfig],
    rules: {
      'vitest/prefer-describe-function-title': 'off',
      'vitest/require-hook': 'off',
    },
  },
  globalIgnores([...sharedIgnores, './types']),
  prettierConfig,
);

export default config;
