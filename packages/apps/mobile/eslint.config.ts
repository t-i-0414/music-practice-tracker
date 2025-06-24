// https://docs.expo.dev/guides/using-eslint/
import { createBaseConfig } from '@music-practice-tracker/eslint-configs';
import expoConfig from 'eslint-config-expo/flat.js';
import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const baseConfig = createBaseConfig({ includesTsEslintPlugin: false });

const config = tseslint.config(
  {
    extends: [expoConfig, baseConfig],
  },
  globalIgnores([...(baseConfig[0].ignores || []), 'scripts/reset-project.js']),
);

export default config;
