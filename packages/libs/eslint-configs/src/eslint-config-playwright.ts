import playwright from 'eslint-plugin-playwright';
import tseslint, { type ConfigArray } from 'typescript-eslint';

import { disabledRulesOnTests } from './eslint-config-vitest';

export const playwrightConfig: ConfigArray = tseslint.config({
  extends: [playwright.configs['flat/recommended']],
  rules: disabledRulesOnTests,
});
