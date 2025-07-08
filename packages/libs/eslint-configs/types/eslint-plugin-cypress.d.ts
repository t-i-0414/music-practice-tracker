declare module 'eslint-plugin-cypress' {
  import type { ConfigArray } from 'typescript-eslint';

  const config: ConfigArray;
  const obj = { configs: { recommended: config } };
  export default obj;
}
