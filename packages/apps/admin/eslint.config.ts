import { FlatCompat } from '@eslint/eslintrc';
import { createBaseConfig } from '@music-practice-tracker/eslint-configs';
import { dirname } from 'path';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const nextEslintConfig = [...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier')];
const baseConfig = createBaseConfig({ includesTsEslintPlugin: false, includeImportPlugin: false });

const config = tseslint.config({
  extends: [nextEslintConfig, baseConfig],
});

export default config;
