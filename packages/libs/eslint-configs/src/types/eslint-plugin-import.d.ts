declare module 'eslint-plugin-import' {
  import type { ConfigArray } from 'typescript-eslint';

  const config: ConfigArray;
  export default { flatConfigs: { recommended: config, typescript: config } };
}
