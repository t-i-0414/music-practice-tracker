import 'dotenv/config';

const port = process.env.ADMIN_PORT ?? '8000';

console.log(`🔗 Starting production server`);

Bun.spawnSync(['next', 'build'], {
  stdout: 'inherit',
  stderr: 'inherit',
});

Bun.spawnSync(['next', 'start', '--port', port], {
  stdout: 'inherit',
  stderr: 'inherit',
});
