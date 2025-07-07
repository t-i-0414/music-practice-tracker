import tseslint from 'typescript-eslint';

import { createBaseConfig } from './base.config';

export default tseslint.config({
  extends: [createBaseConfig()],
  rules: {
    'no-warning-comments': 'off',
    '@typescript-eslint/prefer-destructuring': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/no-magic-numbers': 'off',
    '@typescript-eslint/no-deprecated': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unsafe-type-assertion': 'off',
  },
});
