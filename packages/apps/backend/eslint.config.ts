import { backendEslintConfig } from '@music-practice-tracker/eslint-configs';
import tseslint from 'typescript-eslint';

const config = tseslint.config({
  extends: [backendEslintConfig],
});

export default config;
