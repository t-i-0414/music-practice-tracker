import { defineConfig } from 'eslint/config';
import playwright from 'eslint-plugin-playwright';

import { disabledRulesOnTests } from './eslint-config-vitest';

export const playwrightConfig: ReturnType<typeof defineConfig> = defineConfig({
  extends: [playwright.configs['flat/recommended']],
  rules: { ...disabledRulesOnTests, 'no-undef': 'off' },
});
