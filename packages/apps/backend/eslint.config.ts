import { backendEslintConfig } from '@music-practice-tracker/eslint-configs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const config = tseslint.config({
  extends: [backendEslintConfig],
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.jest,
    },
    sourceType: 'commonjs',
    parserOptions: {
      projectService: true,
      tsconfigRootDir: __dirname,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
  },
});

export default config;
