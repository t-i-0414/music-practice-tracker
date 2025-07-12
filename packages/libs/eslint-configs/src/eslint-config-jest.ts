import jestPlugin from 'eslint-plugin-jest';
import tseslint, { type ConfigArray } from 'typescript-eslint';

import { disabledRulesOnTests } from './eslint-config-vitest';

export const jestConfig: ConfigArray = tseslint.config({
  extends: [jestPlugin.configs['flat/all']],
  rules: {
    ...disabledRulesOnTests,
    'jest/prefer-importing-jest-globals': 'off',
    'jest/no-hooks': 'off',
    'jest/prefer-expect-assertions': [
      'error',
      {
        onlyFunctionsWithAsyncKeyword: true,
        onlyFunctionsWithExpectInLoop: true,
        onlyFunctionsWithExpectInCallback: true,
      },
    ],
  },
});
