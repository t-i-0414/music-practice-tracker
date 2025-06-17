// @ts-check
import eslint from '@eslint/js';
import customRulesPlugin from '@music-practice-tracker/eslint-rules';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

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
      'custom-rules': customRulesPlugin.default,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'custom-rules/prisma-find-naming-convention': 'error',
      'custom-rules/prisma-update-naming-convention': 'error',
      'custom-rules/prisma-create-no-deleted-at': 'error',
      'custom-rules/prisma-create-naming-convention': 'error',
      'custom-rules/prisma-delete-naming-convention': 'error',
    },
  },
);
