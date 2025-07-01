import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import { baseReactConfig } from '@music-practice-tracker/eslint-configs';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const nextEslintConfig = [...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier')];
const config = tseslint.config({
  extends: [nextEslintConfig, baseReactConfig],
});

export default config;
