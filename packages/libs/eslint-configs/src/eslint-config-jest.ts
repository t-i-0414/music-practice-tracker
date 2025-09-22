import { defineConfig } from 'eslint/config';
import jestPlugin from 'eslint-plugin-jest';

import { disabledRulesOnTests } from './eslint-config-vitest';

export const jestConfig = defineConfig({
  extends: [jestPlugin.configs['flat/all']],
  rules: {
    ...disabledRulesOnTests,
    'jest/unbound-method': 'off',
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
