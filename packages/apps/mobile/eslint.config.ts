import {
  baseConfig,
  storybookConfig,
  reactNativeConfig,
  sharedIgnores,
  tsConfigRules,
  importConfigRules,
  reactConfigRules,
  testFilePatterns,
  vitestConfig,
  baseScriptConfigRules,
} from '@music-practice-tracker/eslint-configs';
import { globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

const config = tseslint.config(
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ['tests/storybook/.rnstorybook/**/*', 'tests/storybook/.storybook/**/*'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.storybook.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    extends: [baseConfig, reactNativeConfig],
    rules: { ...tsConfigRules, ...importConfigRules, ...reactConfigRules },
  },
  {
    files: ['scripts/**/*.ts'],
    rules: {
      '@typescript-eslint/no-magic-numbers': 'off',
    },
  },
  {
    files: testFilePatterns({ prefix: 'tests/unit' }),
    extends: [vitestConfig],
  },
  {
    extends: [storybookConfig],
  },
  {
    files: ['src/app/_layout.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    files: ['scripts/**/*.ts', 'scripts/**/*.js'],
    rules: baseScriptConfigRules,
  },
  globalIgnores([
    ...sharedIgnores,
    '.expo',
    'scripts/reset-project.js',
    'babel.config.js',
    'metro.config.js',
    'tests/storybook/.rnstorybook/storybook.requires.ts',
  ]),
  prettierConfig,
);

export default config;
