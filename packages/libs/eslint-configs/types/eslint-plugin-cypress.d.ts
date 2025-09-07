declare module 'eslint-plugin-cypress' {
  import type { Linter } from 'eslint';

  const config: Linter.Config;
  const obj = { configs: { recommended: config } };
  export default obj;
}
