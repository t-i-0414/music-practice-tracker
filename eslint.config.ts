import { baseConfig, importConfig, sharedIgnores, tsConfig } from '@music-practice-tracker/eslint-configs';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';

const config: ReturnType<typeof defineConfig> = defineConfig(
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
  globalIgnores([...sharedIgnores, './packages', './.rulesync']),
  prettierConfig,
);

export default config;
