import {
  baseConfig,
  baseScriptConfigRules,
  importConfigRules,
  jestConfig,
  reactConfigRules,
  reactNativeConfig,
  sharedIgnores,
  storybookConfig,
  testFilePatterns,
  tsConfigRules,
} from '@music-practice-tracker/eslint-configs';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

const config = defineConfig(
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'unused-imports': unusedImportsPlugin,
    },
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
    extends: [jestConfig],
    rules: {
      // Path aliases (@/) are not resolved by ESLint
      'jest/valid-mock-module-path': 'off',
      // Type inference works fine without explicit type parameters
      'jest/no-untyped-mock-factory': 'off',
      // toBeDefined() is explicit and intentional
      'jest/no-unnecessary-assertion': 'off',
      // waitFor and other patterns don't always end with expect
      'jest/prefer-ending-with-an-expect': 'off',
      // Top-level mock setup is standard Jest pattern
      'jest/require-hook': 'off',
      // toHaveBeenCalledTimes is valid when args don't matter
      'jest/prefer-called-with': 'off',
      // Stylistic preferences - padding rules
      'jest/padding-around-all': 'off',
      'jest/padding-around-expect-groups': 'off',
      // Component names as describe titles is acceptable
      'jest/prefer-lowercase-title': 'off',
    },
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
