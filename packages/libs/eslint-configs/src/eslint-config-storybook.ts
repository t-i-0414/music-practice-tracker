import storybookPlugin from 'eslint-plugin-storybook';
import tseslint, { type ConfigArray } from 'typescript-eslint';
export const storybookConfig: ConfigArray = tseslint.config(
  {
    files: ['**/stories/**/*.ts', '**/stories/**/*.tsx', '**/*/*.stories.ts', '**/*/*.stories.tsx'],
    extends: [storybookPlugin.configs['flat/recommended']],
  },
  {
    files: ['**/.storybook/**/*.ts'],
    rules: {
      'storybook/no-uninstalled-addons': 'off',
    },
  },
);
