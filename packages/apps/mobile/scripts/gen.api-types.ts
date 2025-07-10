import 'dotenv/config';

const host = process.env.HOST ?? 'localhost';
const port = process.env.APP_API_PORT ?? '3000';

console.log(`🔗 Generating API types at http://${host}:${port}/api`);

const proc = Bun.spawnSync(
  ['openapi-typescript', `http://${host}:${port}/api-json`, '-o', 'generated/types/api.d.ts'],
  {
    stdout: 'inherit',
    stderr: 'inherit',
  },
);

console.log(proc.exitCode === 0 ? '✅ API types generated successfully.' : '❌ Failed to generate API types.');
