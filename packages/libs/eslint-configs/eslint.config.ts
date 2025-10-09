import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';

import { baseConfig, tsConfig, sharedIgnores, importConfig } from './src';

const config: ReturnType<typeof defineConfig> = defineConfig(
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
