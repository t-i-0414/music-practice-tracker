// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import noPrismaDeleteOutsideHardDelete from '@music-practice-tracker/eslint-rules/dist/no-prisma-delete-outside-hard-delete.js';
import prismaFindNamingConvention from '@music-practice-tracker/eslint-rules/dist/prisma-find-naming-convention.js';
import prismaUpdateNamingConvention from '@music-practice-tracker/eslint-rules/dist/prisma-update-naming-convention.js';
import prismaCreateNoDeletedAt from '@music-practice-tracker/eslint-rules/dist/prisma-create-no-deleted-at.js';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
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
  {
    plugins: {
      'custom-rules': {
        rules: {
          'no-prisma-delete-outside-hard-delete': noPrismaDeleteOutsideHardDelete,
          'prisma-find-naming-convention': prismaFindNamingConvention,
          'prisma-update-naming-convention': prismaUpdateNamingConvention,
          'prisma-create-no-deleted-at': prismaCreateNoDeletedAt,
        },
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'custom-rules/no-prisma-delete-outside-hard-delete': 'error',
      'custom-rules/prisma-find-naming-convention': 'error',
      'custom-rules/prisma-update-naming-convention': 'error',
      'custom-rules/prisma-create-no-deleted-at': 'error',
    },
  },
);
