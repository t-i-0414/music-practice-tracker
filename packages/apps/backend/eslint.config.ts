import {
  baseConfig,
  importConfig,
  jestConfig,
  sharedIgnores,
  testFilePatterns,
  tsConfig,
} from '@music-practice-tracker/eslint-configs';
import { pluginBackend } from '@music-practice-tracker/eslint-rules';
import { globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

const enabledBackendPluginRules = Object.keys(pluginBackend.rules).reduce<Record<string, 'error'>>((acc, rule) => {
  acc[`custom-backend-eslint/${rule}`] = 'error';
  return acc;
}, {});

const config = tseslint.config(
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
    files: ['tests/**/*.ts'],
    rules: {
      'custom-backend-eslint/prisma-repository-only-access': 'off',
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
    },
  },
  globalIgnores(sharedIgnores),
  prettierConfig,
);

export default config;
