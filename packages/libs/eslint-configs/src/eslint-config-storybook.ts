import { defineConfig } from 'eslint/config';
import storybookPlugin from 'eslint-plugin-storybook';
export const storybookConfig = defineConfig(
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
