import { pluginBackend } from '@music-practice-tracker/eslint-rules';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import tseslint, { type ConfigArray } from 'typescript-eslint';
import baseConfig from './base-eslint.config.js';

const config: ConfigArray = tseslint.config(
  {
    extends: [baseConfig],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
    },
    plugins: {
      'custom-backend-eslint': pluginBackend,
    },
    rules: {
      'custom-backend-eslint/prisma-find-naming-convention': 'error',
      'custom-backend-eslint/prisma-update-naming-convention': 'error',
      'custom-backend-eslint/prisma-create-no-deleted-at': 'error',
      'custom-backend-eslint/prisma-create-naming-convention': 'error',
      'custom-backend-eslint/prisma-delete-naming-convention': 'error',
      'custom-backend-eslint/prisma-repository-only-access': 'error',
      'custom-backend-eslint/repository-model-access-restriction': 'error',
    },
  },
  prettierConfig,
);

export default config;
