import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import importPlugin from 'eslint-plugin-import';
import tseslint, { type ConfigArray } from 'typescript-eslint';

export const importConfigRules: FlatConfig.Rules = {
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
  rules: importConfigRules,
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
});
