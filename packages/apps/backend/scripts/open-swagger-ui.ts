import 'dotenv/config';
import * as open from 'open';

const CRASH_EXIT_CODE = 1;

const [, , target] = process.argv;

if (!target || !['admin', 'app'].includes(target)) {
  console.error("❌ Please specify 'admin' or 'app'");
  process.exit(CRASH_EXIT_CODE);
}

const host = process.env.HOST ?? 'localhost';
const port = target === 'admin' ? (process.env.ADMIN_API_PORT ?? '3001') : (process.env.APP_API_PORT ?? '3000');

console.log(`🔗 Opening Swagger UI for ${target} at http://${host}:${port}/api`);

open(`http://${host}:${port}/api`)
  .then(() => {
    console.log(`✅ Swagger UI for ${target} opened successfully.`);
  })
  .catch((error: unknown) => {
    console.error(`❌ Failed to open Swagger UI for ${target}:`, error);
    process.exit(CRASH_EXIT_CODE);
  });
