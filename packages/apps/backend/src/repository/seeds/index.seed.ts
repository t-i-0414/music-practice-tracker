import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function runSeed(name: string, command: string): Promise<void> {
  console.log(`\n[seed-all] Running ${name}...`);
  console.log(`[seed-all] Command: ${command}`);

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      env: { ...process.env },
    });

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    console.log(`[seed-all] ${name} completed successfully`);
  } catch (error) {
    console.error(`[seed-all] ${name} failed:`, error);
    throw error;
  }
}

async function main(): Promise<void> {
  console.log('[seed-all] Starting all seeds...');
  console.log('[seed-all] Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/u, ':****@'));

  try {
    // Run Firebase auth seed first
    await runSeed('Firebase Auth', 'bun run seed:firebase-auth');

    // Then run user seed to create database records
    await runSeed('User', 'bun run seed:user');

    console.log('\n[seed-all] All seeds completed successfully!');
  } catch (error) {
    console.error('[seed-all] Seed process failed:', error);
    throw error;
  }
}

void main()
  .then(() => {
    console.log('[seed-all] Done');
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error('[seed-all] Fatal error:', error);
    process.exit(1);
  });
