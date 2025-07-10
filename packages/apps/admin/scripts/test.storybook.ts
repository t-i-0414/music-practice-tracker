import 'dotenv/config';

const port = process.env.ADMIN_STORYBOOK_PORT ?? '6006';

console.log(`🔗 Starting storybook server`);

Bun.spawnSync(['storybook', 'dev', '-p', port, '-c', 'tests/storybook/.storybook'], {
  stdout: 'inherit',
  stderr: 'inherit',
});
