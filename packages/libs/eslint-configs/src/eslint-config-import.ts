import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import importPlugin from 'eslint-plugin-import';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import tseslint, { type ConfigArray } from 'typescript-eslint';

export const importConfigRules: FlatConfig.Rules = {
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
  'unused-imports/no-unused-imports': 'error',
  'unused-imports/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      ignoreRestSiblings: true,
    },
  ],
  'import/order': [
    'error',
    {
      groups: ['builtin', 'external', 'parent', 'sibling', 'index', 'object'],
      pathGroups: [
        {
          pattern: '{react,react-dom/**,react-router-dom}',
          group: 'builtin',
          position: 'before',
        },
        {
          pattern: '@/**',
          group: 'internal',
          position: 'after',
        },
      ],
      pathGroupsExcludedImportTypes: ['builtin'],
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
      warnOnUnassignedImports: true,
      'newlines-between': 'always',
    },
  ],
};

export const importConfig: ConfigArray = tseslint.config({
  extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
  plugins: {
    'unused-imports': unusedImportsPlugin,
  },
  rules: importConfigRules,
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
});
