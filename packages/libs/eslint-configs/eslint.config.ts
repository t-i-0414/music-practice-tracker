import tseslint from 'typescript-eslint';

import baseConfig from './src/base.config';

export default tseslint.config({
  extends: [baseConfig],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
