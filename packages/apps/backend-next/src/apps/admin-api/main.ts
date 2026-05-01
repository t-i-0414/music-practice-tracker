/**
 * Admin API entry. Listens on ADMIN_API_PORT (default 3001).
 * Mirrors src/apps/app-api/main.ts. See that file's comments for BetterAuth
 * mounting instructions.
 */
import { HttpLayerRouter } from '@effect/platform';
import { BunHttpServer, BunRuntime } from '@effect/platform-bun';
import { Layer, Logger, LogLevel } from 'effect';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { createAdminAuth } from '@/auth/admin-auth';
import { makeStubSendMagicLink } from '@/auth/email';
import { AdminApi } from '@/http/api-admin/health.api';
import { HealthGroupLive } from '@/http/handlers-admin/health/health.handler';
import { PinoLoggerLive } from '@/observability/logger';
import { Db } from '@/repository/db';
import * as schema from '@/repository/schema';

const ADMIN_API_DEFAULT_PORT = 3001;

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (typeof value !== 'string' || value === '') {
    throw new Error(`Required env var ${key} is not set`);
  }
  return value;
};

const databaseUrl = requireEnv('DATABASE_URL');
const betterAuthSecret = requireEnv('BETTER_AUTH_SECRET');
const port = Number(process.env['ADMIN_API_PORT'] ?? ADMIN_API_DEFAULT_PORT);
const baseURL = process.env['ADMIN_BASE_URL'] ?? `http://localhost:${String(port)}`;

const pool = new pg.Pool({ connectionString: databaseUrl });
const db = drizzle(pool, { schema, casing: 'snake_case' });

export const auth = createAdminAuth(db, {
  baseURL,
  secret: betterAuthSecret,
  sendMagicLink: makeStubSendMagicLink('admin'),
});

const DbLayer = Layer.succeed(Db, { db, pool });

const ApiRoutesLayer = HttpLayerRouter.addHttpApi(AdminApi, { openapiPath: '/docs/openapi.json' }).pipe(
  Layer.provide(HealthGroupLive),
);

const ServerLive = HttpLayerRouter.serve(ApiRoutesLayer).pipe(
  Layer.provide(BunHttpServer.layer({ port })),
  Layer.provide(DbLayer),
  Layer.provide(PinoLoggerLive),
  Layer.provide(Logger.minimumLogLevel(LogLevel.Debug)),
);

BunRuntime.runMain(Layer.launch(ServerLive));
