// @ts-check
import eslint from '@eslint/js';
import { pluginBackend } from '@music-practice-tracker/eslint-rules';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      'custom-backend-eslint': pluginBackend,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'custom-backend-eslint/prisma-find-naming-convention': 'error',
      'custom-backend-eslint/prisma-update-naming-convention': 'error',
      'custom-backend-eslint/prisma-create-no-deleted-at': 'error',
      'custom-backend-eslint/prisma-create-naming-convention': 'error',
      'custom-backend-eslint/prisma-delete-naming-convention': 'error',
      'custom-backend-eslint/repository-model-access-restriction': 'error',
    },
  },
);
