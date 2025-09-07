import { baseConfig, importConfig, sharedIgnores, tsConfig } from '@music-practice-tracker/eslint-configs';
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';
import { globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

const config: FlatConfig.ConfigArray = tseslint.config(
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    files: ['**/*.ts'],
    extends: [baseConfig, tsConfig, importConfig],
  },
  globalIgnores([...sharedIgnores, './packages']),
  prettierConfig,
);

export default config;
