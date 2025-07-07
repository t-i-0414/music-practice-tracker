import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import { baseReactConfig } from '@music-practice-tracker/eslint-configs';
import cypressPlugin from 'eslint-plugin-cypress';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const nextEslintConfig = [...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier')];
const config = tseslint.config(
  {
    extends: [nextEslintConfig, baseReactConfig],
  },
  cypressPlugin.configs.recommended,
  {
    files: ['tests/**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
    },
  },
  {
    files: ['tests/integration/support/commands.ts', 'tests/integration/support/setup.ts'],
    rules: {
      '@typescript-eslint/no-namespace': 'off',
    },
  },
  {
    ignores: ['**/*/mockServiceWorker.js'],
  },
);

export default config;
