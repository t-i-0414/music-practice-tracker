import { baseConfig, importConfig, sharedIgnores, tsConfig } from '@music-practice-tracker/eslint-configs';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';

export default defineConfig(
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
