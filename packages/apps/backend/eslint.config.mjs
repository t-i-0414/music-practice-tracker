// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import noPrismaDeleteOutsideHardDelete from './eslint-rules/dist/no-prisma-delete-outside-hard-delete.js';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'eslint-rules/**'],
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
        },
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'custom-rules/no-prisma-delete-outside-hard-delete': 'error',
    },
  },
);
