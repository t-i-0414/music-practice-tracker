import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint, { type ConfigArray } from 'typescript-eslint';

export const createBaseConfig = ({ includesTsEslintPlugin = true } = {}): ConfigArray =>
  tseslint.config(
    eslint.configs.recommended,
    ...(includesTsEslintPlugin ? tseslint.configs.recommendedTypeChecked : []),
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
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
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
        eqeqeq: ['error', 'always'],
      },
    },
    globalIgnores(['**/dist/**', '**/coverage/**', '**/generated/**', '**/.turbo/**', '**/node_modules/**']),
    prettierConfig,
  );

export default createBaseConfig();
