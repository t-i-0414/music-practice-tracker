import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    // actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(?:background|color)$/iu,
        date: /Date$/u,
      },
    },
  },

  tags: ['autodocs'],
};

export default preview;
