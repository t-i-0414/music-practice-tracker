import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import vitestPlugin from '@vitest/eslint-plugin';
import tseslint, { type ConfigArray } from 'typescript-eslint';

export const disabledRulesOnTests: FlatConfig.Rules = {
  '@typescript-eslint/init-declarations': 'off',
  '@typescript-eslint/consistent-type-assertions': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-type-assertion': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-magic-numbers': 'off',
  '@typescript-eslint/max-params': 'off',
  '@typescript-eslint/explicit-member-accessibility': 'off',
  '@typescript-eslint/no-misused-spread': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
  'require-atomic-updates': 'off',
  '@typescript-eslint/consistent-type-definitions': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/strict-boolean-expressions': 'off',
  '@typescript-eslint/restrict-template-expressions': 'off',
  '@typescript-eslint/no-unused-expressions': 'off',
  '@typescript-eslint/consistent-type-imports': 'off',
};

export const vitestConfig: ConfigArray = tseslint.config({
  extends: [vitestPlugin.configs.all],
  rules: {
    ...disabledRulesOnTests,
    'vitest/prefer-importing-vitest-globals': 'off',
    'vitest/prefer-expect-assertions': [
      'error',
      {
        onlyFunctionsWithAsyncKeyword: true,
        onlyFunctionsWithExpectInLoop: true,
        onlyFunctionsWithExpectInCallback: true,
      },
    ],
  },
});
