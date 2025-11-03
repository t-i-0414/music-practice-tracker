import { defineConfig } from 'eslint/config';
import { configs } from 'eslint-plugin-storybook';

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
const storybookFlatRecommended = configs['flat/recommended'] as unknown as ReturnType<typeof defineConfig>;

const storyFilesGlobs = ['**/stories/**/*.ts', '**/stories/**/*.tsx', '**/*/*.stories.ts', '**/*/*.stories.tsx'];

export const storybookConfig: ReturnType<typeof defineConfig> = defineConfig(
  ...storybookFlatRecommended.map((config) =>
    config.files
      ? {
          ...config,
          files: storyFilesGlobs,
        }
      : config,
  ),
);
