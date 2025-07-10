import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import { createBaseReactNativeConfig } from '@music-practice-tracker/eslint-configs';
import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const expoConfig = [...compat.extends('expo')];

const config = tseslint.config(
  {
    extends: [
      expoConfig,
      createBaseReactNativeConfig({
        includesTsEslintPlugin: true,
        includeImportPlugin: false,
        includeReactHooks: false,
      }),
    ],
  },
  {
    files: ['src/app/_layout.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    }
  },
  globalIgnores(['scripts/reset-project.js', 'babel.config.js', 'metro.config.js']),
);

export default config;
