import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { request } from 'node:http';
import { resolve as resolvePath } from 'node:path';

const READY_LOG_TOKEN = 'All emulators ready';
const DEFAULT_AUTH_HOST = 'localhost:9099';
const DEFAULT_PROJECT_ID = 'music-practice-tracker-test';
const EMULATOR_READY_TIMEOUT_MS = 20_000;
const EMULATOR_SHUTDOWN_TIMEOUT_MS = 5_000;
const INTERNAL_SERVER_ERROR_CODE = 500;

export type AuthEmulatorState = {
  shouldStop: boolean;
  child?: ChildProcess;
};

let currentState: AuthEmulatorState | undefined = undefined;

export function getAuthEmulatorState(): AuthEmulatorState | undefined {
  return currentState;
}

export function setAuthEmulatorState(state: AuthEmulatorState | undefined): void {
  currentState = state;
  globalThis.__FIREBASE_AUTH_EMULATOR__ = state;
}

export function clearAuthEmulatorState(): void {
  setAuthEmulatorState(undefined);
}

function resolveEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value.trim() === '') {
    throw new Error(`Environment variable ${key} is required to run Firebase Auth emulator tests.`);
  }
  return value;
}

function normalizeHost(rawHost: string): { hostname: string; port: number } {
  const hostWithoutProtocol = rawHost.replace(/^https?:\/\//u, '');
  const [hostname, portString] = hostWithoutProtocol.split(':');
  const port = Number.parseInt(portString, 10);
  if (Number.isNaN(port)) {
    throw new Error(`Invalid FIREBASE_AUTH_EMULATOR_HOST port: ${portString}`);
  }
  return { hostname, port };
}

async function isEmulatorRunning(host: string, projectId: string): Promise<boolean> {
  const { hostname, port } = normalizeHost(host);

  return new Promise<boolean>((resolve) => {
    const req = request(
      {
        protocol: 'http:',
        hostname,
        port,
        path: `/emulator/v1/projects/${projectId}/accounts`,
        method: 'GET',
        timeout: 1_000,
      },
      (res) => {
        res.resume();
        resolve((res.statusCode ?? INTERNAL_SERVER_ERROR_CODE) < INTERNAL_SERVER_ERROR_CODE);
      },
    );

    req.on('error', () => {
      resolve(false);
    });
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function waitForEmulatorReady(child: ChildProcess, timeoutMs: number, logs: string[]): Promise<void> {
  let resolved = false;

  const { stdout } = child;
  const { stderr } = child;
  if (stdout === null || stderr === null) {
    throw new Error('Firebase Auth emulator stdout/stderr streams are not available.');
  }

  await new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      reject(new Error(`Timed out after ${timeoutMs}ms while waiting for Firebase Auth emulator to start.`));
    }, timeoutMs);

    const onOutput = (chunk: Buffer) => {
      const text = chunk.toString();
      logs.push(text);
      if (!resolved && text.includes(READY_LOG_TOKEN)) {
        resolved = true;
        clearTimeout(timeoutId);
        cleanup();
        resolve();
      }
    };

    const onError = (err: Error) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeoutId);
      cleanup();
      reject(err);
    };

    const onExit = (code: number | null) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeoutId);
      cleanup();
      const error = new Error(
        `Firebase Auth emulator exited before becoming ready (exit code ${code ?? 'unknown'}). Logs:\n${logs.join('')}`,
      );
      reject(error);
    };

    const cleanup = () => {
      stdout.off('data', onOutput);
      stderr.off('data', onOutput);
      child.off('error', onError);
      child.off('exit', onExit);
    };

    stdout.on('data', onOutput);
    stderr.on('data', onOutput);
    child.once('error', onError);
    child.once('exit', onExit);
  });
}

export async function ensureAuthEmulator(): Promise<AuthEmulatorState> {
  const host = resolveEnv('FIREBASE_AUTH_EMULATOR_HOST', DEFAULT_AUTH_HOST);
  const projectId = resolveEnv('FIREBASE_PROJECT_ID', DEFAULT_PROJECT_ID);

  process.env.FIREBASE_AUTH_EMULATOR_HOST = host;
  process.env.FIREBASE_PROJECT_ID = projectId;

  if (await isEmulatorRunning(host, projectId)) {
    return { shouldStop: false };
  }

  const cwd = resolvePath(__dirname, '../..');
  const child = spawn('make', ['start-firebase-test-emulators'], {
    cwd,
    env: {
      ...process.env,
      FIREBASE_AUTH_EMULATOR_HOST: host,
      FIREBASE_PROJECT_ID: projectId,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const logs: string[] = [];

  try {
    await waitForEmulatorReady(child, EMULATOR_READY_TIMEOUT_MS, logs);
  } catch (error) {
    child.kill('SIGINT');
    await once(child, 'exit');
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${message}\nEmulator logs:\n${logs.join('')}`);
  }

  return {
    shouldStop: true,
    child,
  };
}

export async function shutdownAuthEmulator(state: AuthEmulatorState | undefined): Promise<void> {
  if (state?.shouldStop === undefined) {
    return;
  }

  if (state.child === undefined) {
    return;
  }

  const { child } = state;
  if (!child.killed) {
    child.kill('SIGINT');
  }

  try {
    await Promise.race([
      once(child, 'exit'),
      new Promise<void>((resolve) => {
        setTimeout(resolve, EMULATOR_SHUTDOWN_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (!child.killed) {
      child.kill('SIGKILL');
    }
  }
}
