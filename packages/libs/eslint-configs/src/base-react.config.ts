import prettierConfig from 'eslint-config-prettier/flat';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import testingLibraryPlugin from 'eslint-plugin-testing-library';
import tseslint, { type ConfigArray } from 'typescript-eslint';

import { createBaseConfig, testFilePatterns } from './base.config';

export const createBaseReactConfig = ({
  includesTsEslintPlugin = true,
  includeImportPlugin = true,
  includeReactHooks = true,
} = {}): ConfigArray =>
  tseslint.config(
    reactPlugin.configs.flat.recommended,
    reactPlugin.configs.flat['jsx-runtime'],
    includeReactHooks ? reactHooks.configs['recommended-latest'] : [],
    {
      extends: [createBaseConfig({ includesTsEslintPlugin, includeImportPlugin })],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      plugins: {
        reactPlugin,
      },
      rules: {
        // React-specific rules
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
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
    {
      ...testingLibraryPlugin.configs['flat/react'],
      files: testFilePatterns,
      rules: {
        'testing-library/prefer-screen-queries': 'off',
      },
    },
    prettierConfig,
  );

export default createBaseReactConfig({
  includesTsEslintPlugin: false,
  includeImportPlugin: false,
  includeReactHooks: false,
});
