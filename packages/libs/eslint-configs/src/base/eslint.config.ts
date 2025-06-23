import eslint from '@eslint/js';
import { pluginBackend } from '@music-practice-tracker/eslint-rules';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import tseslint, { type ConfigArray } from 'typescript-eslint';

const config: ConfigArray = tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.es2021,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'custom-backend-eslint': pluginBackend,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      'no-console': 'error',
      'no-debugger': 'error',
      'no-alert': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],

      // pluginBackend
      'custom-backend-eslint/prisma-find-naming-convention': 'error',
      'custom-backend-eslint/prisma-update-naming-convention': 'error',
      'custom-backend-eslint/prisma-create-no-deleted-at': 'error',
      'custom-backend-eslint/prisma-create-naming-convention': 'error',
      'custom-backend-eslint/prisma-delete-naming-convention': 'error',
      'custom-backend-eslint/prisma-repository-only-access': 'error',
      'custom-backend-eslint/repository-model-access-restriction': 'error',
    },
    ignores: ['**/dist/**', '**/coverage/**', '**/generated/**', '**/.turbo/**', '**/node_modules/**'],
  },
  prettierConfig,
);

export default config;
