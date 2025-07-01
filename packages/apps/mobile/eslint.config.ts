import { baseReactNativeConfig } from '@music-practice-tracker/eslint-configs';
// https://docs.expo.dev/guides/using-eslint/
import expoConfig from 'eslint-config-expo/flat.js';
import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const config = tseslint.config(
  {
    extends: [expoConfig, baseReactNativeConfig],
  },
  globalIgnores(['scripts/reset-project.js']),
);

export default config;
