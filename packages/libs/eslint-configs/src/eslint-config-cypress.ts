import cypressPlugin from 'eslint-plugin-cypress';
import tseslint, { type ConfigArray } from 'typescript-eslint';

import { disabledRulesOnTests } from './eslint-config-vitest';

export const cypressConfig: ConfigArray = tseslint.config({
  extends: [cypressPlugin.configs.recommended],
  rules: {
    ...disabledRulesOnTests,
  },
});
