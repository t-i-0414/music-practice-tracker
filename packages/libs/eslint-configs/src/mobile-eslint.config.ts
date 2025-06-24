// https://docs.expo.dev/guides/using-eslint/
import expoConfig from 'eslint-config-expo/flat.js';
import tseslint, { type ConfigArray } from 'typescript-eslint';
import { createBaseConfig } from './base-eslint.config.js';

const config: ConfigArray = tseslint.config({
  extends: [expoConfig, createBaseConfig({ includesTsEslintPlugin: false })],
});

export default config;
