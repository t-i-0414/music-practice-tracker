import 'dotenv/config';

import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Set it in .env or .env.test before running drizzle-kit.');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/repository/schema/index.ts',
  out: './drizzle',
  dbCredentials: { url: databaseUrl },
  strict: true,
  verbose: true,
});
