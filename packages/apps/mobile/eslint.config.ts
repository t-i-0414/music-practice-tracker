import { baseReactNativeConfig } from '@music-practice-tracker/eslint-configs';
import { globalIgnores } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import tseslint from 'typescript-eslint';

const config = tseslint.config(
  {
    extends: [expoConfig, baseReactNativeConfig],
  },
  globalIgnores(['scripts/reset-project.js']),
);

export default config;
