import {
  baseConfig,
  importConfig,
  sharedIgnores,
  tsConfig,
  vitestConfig,
  testFilePatterns,
} from '@music-practice-tracker/eslint-configs';
import type { Linter } from 'eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier/flat';

/**
 * ESLint config for backend-next.
 *
 * Custom rules from @music-practice-tracker/eslint-plugins are intentionally
 * NOT applied here yet — most of them are Prisma-specific and need to be
 * rewritten for Drizzle (see plan.md §1.6). The other session should:
 *   1. Update eslint-plugins to add Drizzle equivalents
 *      (`drizzle-repository-method-restriction`, replacing `repository-model-access-restriction`).
 *   2. Re-enable here once available.
 */
const config: Linter.Config[] = defineConfig(
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.ts'],
    extends: [baseConfig, tsConfig, importConfig],
  },
  {
    files: testFilePatterns({ prefix: 'tests' }),
    extends: [vitestConfig],
  },
  globalIgnores(sharedIgnores),
  prettierConfig,
);

export default config;
