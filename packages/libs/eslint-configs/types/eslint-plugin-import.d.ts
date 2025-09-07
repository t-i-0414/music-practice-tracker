declare module 'eslint-plugin-import' {
  import type { Linter } from 'eslint';

  const config: Linter.Config;
  export default { flatConfigs: { recommended: config, typescript: config } };
}
