import 'dotenv/config';

const port = process.env.APP_API_PORT ?? '3000';

console.log(`🔗 Generating API types at http://localhost:${port}/api`);

const proc = Bun.spawnSync(
  ['openapi-typescript', `http://localhost:${port}/api-json`, '-o', 'generated/types/api.d.ts'],
  {
    stdout: 'inherit',
    stderr: 'inherit',
  },
);

console.log(proc.exitCode === 0 ? '✅ API types generated successfully.' : '❌ Failed to generate API types.');
