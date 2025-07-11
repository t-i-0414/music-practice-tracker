import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import {
  baseConfig,
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
import { globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const nextEslintConfig = [...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier')];
const config = tseslint.config(
  ...nextEslintConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
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
  globalIgnores(sharedIgnores),
  prettierConfig,
);

export default config;
