import {
  baseConfig,
  baseScriptConfigRules,
  importConfig,
  jestConfig,
  sharedIgnores,
  testFilePatterns,
  tsConfig,
} from '@music-practice-tracker/eslint-configs';
import { pluginBackend } from '@music-practice-tracker/eslint-plugins';
import type { Linter } from 'eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';

const enabledBackendPluginRules = Object.keys(pluginBackend.rules).reduce<Record<string, 'error'>>((acc, rule) => {
  acc[`custom-backend-eslint/${rule}`] = 'error';
  return acc;
}, {});

const config: Linter.Config[] = defineConfig(
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ['**/*.ts'],
    extends: [baseConfig, tsConfig, importConfig],
    plugins: {
      'custom-backend-eslint': pluginBackend,
    },
    rules: enabledBackendPluginRules,
  },
  {
    files: ['src/firebase-auth/**/*.ts'],
    plugins: {
      'custom-backend-eslint': pluginBackend,
    },
    rules: {
      ...enabledBackendPluginRules,
      'custom-backend-eslint/prisma-naming-convention': 'off',
    },
  },
  {
    files: ['src/repository/**/*.ts'],
    plugins: {
      'custom-backend-eslint': pluginBackend,
    },
    rules: {
      ...enabledBackendPluginRules,
      'custom-backend-eslint/repository-model-access-restriction': 'off',
    },
  },
  {
    files: ['src/domain/aggregates/firebase-auth/firebase-auth.provider.ts'],
    plugins: {
      'custom-backend-eslint': pluginBackend,
    },
    rules: {
      ...enabledBackendPluginRules,
      'custom-backend-eslint/prisma-naming-convention': 'off',
    },
  },
  {
    files: [...testFilePatterns({ prefix: 'tests' }), '**/tests/**/helpers/**/*.ts'],
    extends: [jestConfig],
    rules: {
      'jest/max-expects': ['error', { max: 10 }],
      'jest/expect-expect': [
        'error',
        {
          assertFunctionNames: [
            'expect',
            'expectJsonResponse',
            'expectInternalServerError',
            'expectNotFoundError',
            'expectUuidValidationError',
            'expectNoContentResponse',
          ],
          additionalTestBlockFunctions: ['it', 'test'],
        },
      ],
      'jest/no-unnecessary-assertion': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['scripts/**/*.ts', 'scripts/**/*.js'],
    rules: { ...baseScriptConfigRules, 'custom-backend-eslint/throw-new-common-error-only': 'off' },
  },
  {
    files: ['**/*.seed.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      'custom-backend-eslint/throw-new-common-error-only': 'off',
    },
  },
  globalIgnores(sharedIgnores),
  prettierConfig,
);

export default config;
