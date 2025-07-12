import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import testingLibraryPlugin from 'eslint-plugin-testing-library';
import tseslint, { type ConfigArray } from 'typescript-eslint';

export const reactConfigRules: FlatConfig.Rules = {
  'react/jsx-no-useless-fragment': 'error',
  'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary'] }],
  'react/no-unstable-nested-components': 'error',
  'react/no-array-index-key': 'error',
  'react/prefer-stateless-function': ['error', { ignorePureComponents: true }],
  'react/no-redundant-should-component-update': 'error',
  'react/no-access-state-in-setstate': 'error',
  'react/jsx-boolean-value': ['error', 'never'],
  'react/self-closing-comp': 'error',
  'react/function-component-definition': [
    'error',
    {
      namedComponents: 'arrow-function',
      unnamedComponents: 'arrow-function',
    },
  ],
};

export const reactConfig: ConfigArray = tseslint.config(
  reactPlugin.configs.flat['recommended'],
  reactPlugin.configs.flat['jsx-runtime'],
  reactHooksPlugin.configs['recommended-latest'],
  {
    plugins: { reactPlugin },
    rules: reactConfigRules,
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    ...testingLibraryPlugin.configs['flat/react'],
    rules: {
      'testing-library/prefer-screen-queries': 'off',
    },
  },
);
