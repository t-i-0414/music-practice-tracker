import 'dotenv/config';

const port = process.env.APP_PORT ?? '8081';

console.log(`🔗 Starting development server`);

Bun.spawnSync(['expo', 'start', '--port', port], {
  stdin: 'ignore',
  stdout: 'inherit',
  stderr: 'inherit',
});
