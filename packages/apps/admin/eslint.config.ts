import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import {
  baseConfig,
  baseScriptConfigRules,
  cypressConfig,
  importConfigRules,
  playwrightConfig,
  reactConfigRules,
  sharedIgnores,
  storybookConfig,
  testFilePatterns,
  tsConfigRules,
  vitestConfig,
} from '@music-practice-tracker/eslint-configs';
import { globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const nextEslintConfig = [...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier')];
const config = tseslint.config(
  ...nextEslintConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['tests/integration/**/*'],
    languageOptions: {
      parserOptions: {
        project: ['./tests/integration/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [baseConfig],
    rules: { ...tsConfigRules, ...importConfigRules, ...reactConfigRules },
  },
  {
    files: testFilePatterns({ prefix: 'tests/e2e' }),
    extends: [playwrightConfig],
  },
  {
    files: testFilePatterns({ prefix: 'tests/integration' }),
    extends: [cypressConfig],
  },
  {
    files: testFilePatterns({ prefix: 'tests/unit' }),
    extends: [vitestConfig],
  },
  {
    extends: [storybookConfig],
  },
  {
    files: ['tests/storybook/.storybook/main.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: [
      'tests/e2e/playwright.config.ts',
      'tests/integration/support/commands.ts',
      'tests/integration/support/msw.ts',
      'tests/integration/support/setup.ts',
      'tests/integration/cypress.config.ts',
      'tests/msw/handlers.ts',
    ],
    rules: {
      'no-undef': 'off',

      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/max-params': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-namespace': 'off',
    },
  },
  {
    files: ['scripts/**/*.ts', 'scripts/**/*.js'],
    rules: baseScriptConfigRules,
  },
  globalIgnores([...sharedIgnores, '.next/**']),
  prettierConfig,
);

export default config;
