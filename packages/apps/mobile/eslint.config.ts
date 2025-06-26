import { createBaseConfig } from '@music-practice-tracker/eslint-configs';
// https://docs.expo.dev/guides/using-eslint/
import expoConfig from 'eslint-config-expo/flat.js';
import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const baseConfig = createBaseConfig({ includesTsEslintPlugin: false });
const FIRST_BASE_CONFIG_INDEX = 0;

const config = tseslint.config(
  {
    extends: [expoConfig, baseConfig],
  },
  globalIgnores([...(baseConfig[FIRST_BASE_CONFIG_INDEX].ignores || []), 'scripts/reset-project.js']),
);

export default config;
