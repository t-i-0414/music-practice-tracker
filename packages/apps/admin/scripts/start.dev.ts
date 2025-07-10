import 'dotenv/config';

const port = process.env.ADMIN_PORT ?? '8000';

console.log(`🔗 Starting development server`);

Bun.spawnSync(['next', 'dev', '--turbopack', '--port', port], {
  stdout: 'inherit',
  stderr: 'inherit',
});
