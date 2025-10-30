import {
  baseConfig,
  baseScriptConfigRules,
  cypressConfig,
  importConfigRules,
  playwrightConfig,
  reactConfigRules,
  sharedIgnores,
  storybookConfig,
  testFilePatterns,
  tsConfigRules,
  vitestConfig,
} from '@music-practice-tracker/eslint-configs';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettierConfig from 'eslint-config-prettier/flat';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

const config: ReturnType<typeof defineConfig> = defineConfig(
  ...nextVitals,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['tests/integration/**/*'],
    languageOptions: {
      parserOptions: {
        project: ['./tests/integration/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'unused-imports': unusedImportsPlugin,
    },
    extends: [baseConfig],
    rules: { ...tsConfigRules, ...importConfigRules, ...reactConfigRules },
  },
  {
    files: testFilePatterns({ prefix: 'tests/e2e' }),
    extends: [playwrightConfig],
  },
  {
    files: testFilePatterns({ prefix: 'tests/integration' }),
    extends: [cypressConfig],
  },
  {
    files: testFilePatterns({ prefix: 'tests/unit' }),
    extends: [vitestConfig],
  },
  {
    extends: [storybookConfig],
  },
  {
    files: ['tests/storybook/.storybook/main.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
  {
    files: [
      'tests/e2e/playwright.config.ts',
      'tests/integration/support/commands.ts',
      'tests/integration/support/msw.ts',
      'tests/integration/support/setup.ts',
      'tests/integration/cypress.config.ts',
      'tests/msw/handlers.ts',
    ],
    rules: {
      'no-undef': 'off',

      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/max-params': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-namespace': 'off',
    },
  },
  {
    files: ['scripts/**/*.ts', 'scripts/**/*.js'],
    rules: baseScriptConfigRules,
  },
  globalIgnores([...sharedIgnores, '.next/**', 'next-env.d.ts']),
  prettierConfig,
);

export default config;
