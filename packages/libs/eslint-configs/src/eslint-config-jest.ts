import jestPlugin from 'eslint-plugin-jest';
import tseslint, { type ConfigArray } from 'typescript-eslint';

import { disabledRulesOnTests } from './eslint-config-vitest';

export const jestConfig: ConfigArray = tseslint.config({
  extends: [jestPlugin.configs['flat/all']],
  rules: {
    ...disabledRulesOnTests,
  },
});
