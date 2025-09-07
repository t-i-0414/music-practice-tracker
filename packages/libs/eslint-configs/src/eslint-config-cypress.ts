import { defineConfig } from 'eslint/config';
import cypressPlugin from 'eslint-plugin-cypress';

import { disabledRulesOnTests } from './eslint-config-vitest';

export const cypressConfig = defineConfig({
  extends: [cypressPlugin.configs.recommended],
  rules: {
    ...disabledRulesOnTests,
  },
});
