import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import { globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

import { baseConfig, importConfig, sharedIgnores, tsConfig } from './src';

const config: FlatConfig.ConfigArray = tseslint.config(
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.ts'],
    extends: [baseConfig, tsConfig, importConfig],
  },
  globalIgnores([...sharedIgnores, './types']),
  prettierConfig,
);

export default config;
