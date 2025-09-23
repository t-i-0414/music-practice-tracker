import { resolve } from 'node:path';

import { config as loadEnv } from 'dotenv';

loadEnv({ path: resolve(resolve(__dirname, '..'), '.env.test'), override: true, quiet: true });
process.env.NODE_ENV = 'test';
