import cypressPlugin from 'eslint-plugin-cypress';
import tseslint, { type ConfigArray } from 'typescript-eslint';

export const cypressConfig: ConfigArray = tseslint.config(cypressPlugin.configs.recommended);
